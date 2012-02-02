package liquid;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.Graphics;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.Ellipse2D;
import java.awt.geom.Path2D;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.awt.image.BufferedImageOp;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.util.Observable;
import java.util.Observer;
import javax.swing.JComponent;
import org.jbox2d.collision.shapes.CircleShape;
import org.jbox2d.collision.shapes.PolygonShape;
import org.jbox2d.collision.shapes.Shape;
import org.jbox2d.common.Vec2;
import org.jbox2d.dynamics.Body;
import org.jbox2d.dynamics.BodyType;
import org.jbox2d.dynamics.Fixture;
import org.jbox2d.dynamics.World;

/**
 * Displays a view of a JBox2D world.
 */
public class Viewer extends JComponent implements Observer {

    private static final Color BACKGROUND = Color.BLACK;
    private static final Color FOREGROUND = Color.WHITE;
    private static final Color STATIC     = Color.GRAY;
    private static final int KERNEL_SIZE = 14;
    private static final int THRESHOLD = 0x2f * 3;

    private static final long serialVersionUID = 1L;

    private static final float SCALE = 5f;

    private final World world;
    private final Rectangle2D view;

    private boolean blur = true;
    private boolean threshold = true;

    private final Kernel vkernel;
    private final Kernel hkernel;

    /**
     * Create a display of a world at a given location.
     * @param bottle  the bottle to be displayed
     */
    public Viewer(final Bottle bottle) {
        this.world = bottle.getWorld();
        this.view = bottle.getView();
        Dimension size = new Dimension((int) (view.getWidth() * SCALE),
                                       (int) (view.getHeight() * SCALE));
        setPreferredSize(size);
        vkernel = makeKernel(KERNEL_SIZE, true);
        hkernel = makeKernel(KERNEL_SIZE, false);
        bottle.addObserver(this);
    }

    @Override
    public final void update(final Observable o, final Object arg) {
        repaint();
    }

    /**
     * Turn blurring on or off.
     * @param set  the new value
     */
    public final void setBlur(final boolean set) {
        blur = set;
        repaint();
    }

    /**
     * Turn thresholding on or off.
     * @param set  the new value
     */
    public final void setThreshold(final boolean set) {
        threshold = set;
        repaint();
    }

    @Override
    public final void paintComponent(final Graphics graphics) {
        Graphics2D g = (Graphics2D) graphics;
        if (!blur) {
            g.setColor(BACKGROUND);
            g.fillRect(0, 0, getWidth(), getHeight());
            draw((Graphics2D) g.create(), getWidth(), getHeight(), true,
                 BodyType.DYNAMIC, FOREGROUND);
        } else {
            Dimension size = getPreferredSize();
            BufferedImage work;
            work = new BufferedImage(size.width + KERNEL_SIZE * 2,
                                     size.height + KERNEL_SIZE * 2,
                                     BufferedImage.TYPE_INT_RGB);
            Graphics2D wg = work.createGraphics();
            wg.setColor(BACKGROUND);
            wg.fillRect(0, 0, work.getWidth(), work.getHeight());
            draw(wg, work.getWidth(), work.getHeight(), false,
                 BodyType.DYNAMIC, FOREGROUND);
            wg.dispose();

            /* Blur. */
            BufferedImageOp op = new ConvolveOp(vkernel);
            BufferedImage conv = op.filter(work, null);
            op = new ConvolveOp(hkernel);
            conv = op.filter(conv, null);
            /* Threshold. */
            if (threshold) {
                threshold(conv);
            }
            /* Draw the result. */
            g.drawImage(conv, -KERNEL_SIZE, -KERNEL_SIZE, null);
        }
        draw(g, getWidth(), getHeight(), true,
             BodyType.STATIC, STATIC);
    }

    /**
     * Draw the world onto the given graphics.
     * @param g       the graphics context to use
     * @param width   width of the drawing context
     * @param height  height of the drawing context
     * @param aa      enable anti-aliasing
     * @param type    the type of body to draw
     * @param color   the color to draw the bodies
     */
    private void draw(final Graphics2D g, final int width, final int height,
                      final boolean aa,
                      final BodyType type, final Color color) {
        /* Set up coordinate system. */
        g.translate(width / 2, height / 2);
        g.scale(SCALE, -SCALE);

        if (aa) {
            /* Configure rendering options. */
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
                               RenderingHints.VALUE_ANTIALIAS_ON);
        }

        /* Draw each body. */
        g.setColor(color);
        Body body = world.getBodyList();
        while (body != null) {
            Vec2 pos = body.getPosition();
            float angle = body.getAngle();
            Fixture fixture = body.getFixtureList();
            while (body.m_type == type && fixture != null) {
                Shape shape = fixture.getShape();
                if (shape instanceof CircleShape) {
                    draw(g, pos, (CircleShape) shape);
                } else if (shape instanceof PolygonShape) {
                    draw(g, pos, angle, (PolygonShape) shape);
                } else {
                    System.out.println("Cannot draw shape: " + shape);
                }
                fixture = fixture.getNext();
            }
            body = body.getNext();
        }
    }

    /**
     * Draw a circle shape from the world.
     * @param g    the graphics context to use
     * @param pos  position of the shape
     * @param s    the circle to be drawn
     */
    private void draw(final Graphics2D g, final Vec2 pos, final CircleShape s) {
        Ellipse2D circle = new Ellipse2D.Float(pos.x - s.m_radius,
                                               pos.y - s.m_radius,
                                               s.m_radius * 2, s.m_radius * 2);
        g.fill(circle);
    }

    /**
     * Draw a polygon shape from the world.
     * @param g      the graphics context to use
     * @param pos    position of the shape
     * @param angle  the rotation of the shape
     * @param s      the polygon to be drawn
     */
    private void draw(final Graphics2D g, final Vec2 pos,
                      final float angle, final PolygonShape s) {
        Path2D path = new Path2D.Float();
        Vec2 first = s.getVertex(0);
        path.moveTo(first.x, first.y);
        for (int i = 1; i < s.getVertexCount(); i++) {
            Vec2 v = s.getVertex(i);
            path.lineTo(v.x, v.y);
        }
        path.closePath();
        AffineTransform at = new AffineTransform();
        at.translate(pos.x, pos.y);
        at.rotate(angle);
        g.fill(at.createTransformedShape(path));
    }

    /**
     * Make a blur kernel.
     * @param size      the size of the kernel
     * @param vertical  make the kernel vertical or horizontal
     * @return the specified kernel
     */
    private static Kernel makeKernel(final int size, final boolean vertical) {
        float radius = size;
        int rows = size * 2 + 1;
        float[] matrix = new float[rows];
        float sigma = radius / 3;
        float sigma22 = 2 * sigma * sigma;
        float sigmaPi2 = 2 * (float) Math.PI * sigma;
        float sqrtSigmaPi2 = (float) Math.sqrt(sigmaPi2);
        float radius2 = radius * radius;
        float total = 0;
        int index = 0;
        for (int row = -size; row <= size; row++) {
            float distance = row * row;
            if (distance > radius2) {
                matrix[index] = 0;
            } else {
                matrix[index] = (float) Math.exp(-(distance) / sigma22)
                    / sqrtSigmaPi2;
            }
            total += matrix[index];
            index++;
        }
        for (int i = 0; i < rows; i++) {
            matrix[i] /= total;
        }

        if (vertical) {
            return new Kernel(1, rows, matrix);
        } else {
            return new Kernel(rows, 1, matrix);
        }
    }

    /**
     * Threshold an image.
     * @param im  the image to be thresholded
     */
    private void threshold(final BufferedImage im) {
        for (int i = 0; i < im.getWidth(); i++) {
            for (int j = 0; j < im.getHeight(); j++) {
                Color c = new Color(im.getRGB(i, j));
                if (c.getRed() + c.getGreen() + c.getBlue() > THRESHOLD) {
                    im.setRGB(i, j, FOREGROUND.getRGB());
                } else {
                    im.setRGB(i, j, BACKGROUND.getRGB());
                }
            }
        }
    }
}
