package liquid;

import java.awt.geom.Rectangle2D;
import java.util.Observable;
import java.util.Random;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import lombok.Getter;
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

/**
 * A simulated bottle containing a chunky liquid (large solid particles).
 */
@Log
public class Bottle extends Observable implements Runnable {

    /* Solver */
    private static final int FPS = 30;
    private static final int V_ITERATIONS = 8;
    private static final int P_ITERATIONS = 3;
    private static final double MILLIS = 1000.0;

    /* World */
    private static final float WIDTH = 50f;
    private static final float HEIGHT = 70f;
    private static final float THICKNESS = 1f;
    private static final Vec2 GRAVITY = new Vec2(0, -20f);
    private static final Rectangle2D VIEW =
        new Rectangle2D.Float(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
    private static final long FLIP_RATE = 5000L;

    /* Balls */
    private static final int BALLS = 150;
    private static final float BALL_RADIUS = 0.75f;
    private static final float BALL_DENSITY = 1f;
    private static final float BALL_FRICTION = 0.1f;
    private static final float BALL_RESTITUTION = 0.4f;

    @Getter private final World world;
    private boolean running = false;
    private CountDownLatch latch = new CountDownLatch(1);

    /**
     * Create a new bottle.
     */
    public Bottle() {
        world = new World(GRAVITY, false);
        /* Set up the containment box. */
        buildContainer(world);

        /* Add a ball. */
        Random rng = new Random();
        for (int i = 0; i < BALLS; i++) {
            addBall(world,
                    (rng.nextFloat() - 0.5f) * (WIDTH - BALL_RADIUS),
                    (rng.nextFloat() - 0.5f) * (HEIGHT - BALL_RADIUS));
        }
    }

    @Override
    public final void run() {
        running = true;
        val exec = Executors.newSingleThreadScheduledExecutor();
        exec.scheduleAtFixedRate(new Runnable() {
                public void run() {
                    world.step(1f / FPS, V_ITERATIONS, P_ITERATIONS);
                    setChanged();
                    notifyObservers();
                    if (System.currentTimeMillis() / FLIP_RATE % 2 == 0) {
                        world.setGravity(GRAVITY.negate());
                    } else {
                        world.setGravity(GRAVITY);
                    }
                }
            }, 0L, (long) (MILLIS / FPS), TimeUnit.MILLISECONDS);
        try {
            /* Block the current thread, since we're a Runnable. */
            latch.await();
        } catch (InterruptedException e) {
            log.info("simulation interrupted");
        }
        try {
            /* Stop the executor. */
            exec.shutdown();
            exec.awaitTermination(1L, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            exec.shutdownNow();
            log.info("termination interrupted");
        } catch (java.security.AccessControlException e) {
            /* Can't call shutdown() inside the security sandbox. */
            log.info("looks like we're an applet, can't shutdown");
        } finally {
            running = false;
        }
    }

    /**
     * Stop the simulation, which can be restarted again.
     */
    public final void stop() {
        val old = latch;
        latch = new CountDownLatch(1);
        old.countDown();
    }

    /**
     * Return true if the simulation is running.
     * @return true if the simulation is running
     */
    public final boolean isRunning() {
        return running;
    }

    /**
     * Specify the area of interest for this world.
     * @return a rectangle specifying where things are happening
     */
    public final Rectangle2D getView() {
        return VIEW;
    }

    /**
     * Build the world container.
     * @param world  the world to build the container in
     */
    private static void buildContainer(final World world) {
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

    /**
     * Add a new ball body to the world.
     * @param world  the world to add the ball to
     * @param x      the x-coordinate of the ball
     * @param y      the y-coordinate of the ball
     */
    private static void addBall(final World world,
                                final float x, final float y) {
        BodyDef def = new BodyDef();
        def.position = new Vec2(x, y);
        def.type = BodyType.DYNAMIC;
        CircleShape circle = new CircleShape();
        circle.m_radius = BALL_RADIUS;
        FixtureDef mass = new FixtureDef();
        mass.shape = circle;
        mass.density = BALL_DENSITY;
        mass.friction = BALL_FRICTION;
        mass.restitution = BALL_RESTITUTION;
        world.createBody(def).createFixture(mass);
    }
}
