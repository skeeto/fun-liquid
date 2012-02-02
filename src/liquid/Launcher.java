package liquid;

import java.awt.geom.Rectangle2D;
import java.lang.InterruptedException;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import javax.swing.JFrame;
import lombok.extern.java.Log;
import lombok.val;
import org.jbox2d.collision.shapes.CircleShape;
import org.jbox2d.collision.shapes.PolygonShape;
import org.jbox2d.common.Vec2;
import org.jbox2d.dynamics.Body;
import org.jbox2d.dynamics.BodyDef;
import org.jbox2d.dynamics.BodyType;
import org.jbox2d.dynamics.FixtureDef;
import org.jbox2d.dynamics.World;

@Log
public class Launcher {

    private static final float DT = 1f / 30f; // seconds
    private static final int V_ITERATIONS = 8;
    private static final int P_ITERATIONS = 3;
    private static final float WIDTH = 50f;
    private static final float HEIGHT = 70f;
    private static final float THICKNESS = 1f;
    private static final Vec2 GRAVITY = new Vec2(0, -10);
    private static final Rectangle2D VIEW =
        new Rectangle2D.Float(WIDTH / -2, HEIGHT / -2, WIDTH, HEIGHT);

    /* Balls */
    private static final int BALLS = 20;
    private static final float BALL_DENSITY = 1f;
    private static final float BALL_FRICTION = 0.1f;
    private static final float BALL_RESTITUTION = 0.6f;

    public static void main(String[] args) {
        /* Fix for poor OpenJDK performance. */
        System.setProperty("sun.java2d.pmoffscreen", "false");

        val world = new World(GRAVITY, true);
        val viewer = new Viewer(world, VIEW);
        JFrame frame = new JFrame("Fun Liquid");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.add(viewer);
        frame.setResizable(false);
        frame.pack();
        frame.setVisible(true);

        /* Set up the containment box. */
        buildContainer(world);

        /* Add a ball. */
        Random rng = new Random();
        for (int i = 0; i < BALLS; i++) {
            addBall(world,
                    (rng.nextFloat() - 0.5f) * WIDTH,
                    (rng.nextFloat() - 0.5f) * HEIGHT);
        }

        val exec = Executors.newSingleThreadScheduledExecutor();
        exec.scheduleAtFixedRate(new Runnable() {
                public void run() {
                    while (true) {
                        world.step(DT, V_ITERATIONS, P_ITERATIONS);
                        viewer.repaint();
                    }
                }
            }, 0L, (long) (DT * 1000.0), TimeUnit.MILLISECONDS);
    }

    private static void buildContainer(World world) {
        BodyDef def = new BodyDef();
        PolygonShape box = new PolygonShape();
        Body side;

        def.position = new Vec2(WIDTH / 2, 0);
        box.setAsBox(THICKNESS / 2, HEIGHT / 2);
        world.createBody(def).createFixture(box, 0f);

        def.position = new Vec2(-WIDTH / 2, 0);
        box.setAsBox(THICKNESS / 2, HEIGHT / 2);
        world.createBody(def).createFixture(box, 0f);

        def.position = new Vec2(0, HEIGHT / 2);
        box.setAsBox(WIDTH / 2, THICKNESS / 2);
        world.createBody(def).createFixture(box, 0f);

        def.position = new Vec2(0, -HEIGHT / 2);
        box.setAsBox(WIDTH / 2, THICKNESS / 2);
        world.createBody(def).createFixture(box, 0f);
    }

    private static void addBall(World world, float x, float y) {
        BodyDef def = new BodyDef();
        def.position = new Vec2(x, y);
        def.type = BodyType.DYNAMIC;
        CircleShape circle = new CircleShape();
        circle.m_radius = 1f;
        FixtureDef mass = new FixtureDef();
        mass.shape = circle;
        mass.density = BALL_DENSITY;
        mass.friction = BALL_FRICTION;
        mass.restitution = BALL_RESTITUTION;
        world.createBody(def).createFixture(mass);
    }
}
