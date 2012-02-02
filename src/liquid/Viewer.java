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
import javax.swing.JComponent;
import org.jbox2d.collision.shapes.CircleShape;
import org.jbox2d.collision.shapes.PolygonShape;
import org.jbox2d.collision.shapes.Shape;
import org.jbox2d.common.Vec2;
import org.jbox2d.dynamics.Body;
import org.jbox2d.dynamics.Fixture;
import org.jbox2d.dynamics.World;

public class Viewer extends JComponent {

    private static final Color BACKGROUND = Color.BLACK;
    private static final Color FOREGROUND = Color.WHITE;
    private static final int KERNEL_SIZE = 14;
    private static final int THRESHOLD = 0x2f * 3;

    private static final long serialVersionUID = 1L;

    private static final float SCALE = 5f;

    private final World world;
    private final Rectangle2D view;

    private final Kernel kernel;

    public Viewer(World world, Rectangle2D view) {
        this.world = world;
        this.view = view;
        Dimension size = new Dimension((int) (view.getWidth() * SCALE),
                                       (int) (view.getHeight() * SCALE));
        setPreferredSize(size);
        kernel = makeKernel(KERNEL_SIZE);
    }

    @Override
    public void paintComponent(Graphics graphics) {
        Graphics2D g = (Graphics2D) graphics;
        Dimension size = getPreferredSize();
        BufferedImage work;
        work = new BufferedImage(size.width + KERNEL_SIZE,
                                 size.height + KERNEL_SIZE,
                                 BufferedImage.TYPE_INT_RGB);
        Graphics2D wg = work.createGraphics();
        draw(wg, work.getWidth(), work.getHeight(), false);
        wg.dispose();

        /* Blur. */
        BufferedImageOp op = new ConvolveOp(kernel);
        BufferedImage blur = op.filter(work, null);

        /* Threshold. */
        threshold(blur);

        /* Draw the result. */
        g.drawImage(blur, -KERNEL_SIZE / 2, -KERNEL_SIZE / 2, null);
    }

    private void draw(Graphics2D g, int width, int height, boolean aa) {
        g.setColor(BACKGROUND);
        g.fillRect(0, 0, getWidth(), getHeight());

        /* Set up coordinate system. */
        g.translate(width / 2, height / 2);
        g.scale(SCALE, -SCALE);

        if (aa) {
            /* Configure rendering options. */
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
                               RenderingHints.VALUE_ANTIALIAS_ON);
        }

        /* Draw each body. */
        g.setColor(FOREGROUND);
        Body body = world.getBodyList();
        while (body != null) {
            Vec2 pos = body.getPosition();
            float angle = body.getAngle();
            Fixture fixture = body.getFixtureList();
            while (fixture != null) {
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

    private void draw(Graphics2D g, Vec2 pos, CircleShape s) {
        Ellipse2D circle = new Ellipse2D.Float(pos.x - s.m_radius,
                                               pos.y - s.m_radius,
                                               s.m_radius * 2, s.m_radius * 2);
        g.fill(circle);
    }

    private void draw(Graphics2D g, Vec2 pos, float angle, PolygonShape s) {
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
     * Make a flat blur kernel.
     */
    private static Kernel makeKernel(int size) {
        float base = size * size;
        float[] matrix = new float[size * size];
        for (int i = 0; i < size * size; i++) {
                matrix[i] = 1.0f / base;
        }
        return new Kernel(size, size, matrix);
    }

    private void threshold(BufferedImage im) {
        for (int i = 0; i < im.getWidth(); i++) {
            for (int j = 0; j < im.getHeight(); j++) {
                Color c = new Color(im.getRGB(i, j));
                if (c.getRed() + c.getGreen() + c.getBlue() > THRESHOLD) {
                    im.setRGB(i, j, 0x00ffffff);
                } else {
                    im.setRGB(i, j, 0x00000000);
                }
            }
        }
    }
}
