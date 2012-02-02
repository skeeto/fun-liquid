package liquid;

import java.awt.geom.Rectangle2D;
import java.util.Observable;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import lombok.Getter;
import lombok.extern.java.Log;
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
public class Bottle extends Observable {

    /* Solver */
    private static final int FPS = 30;
    private static final int V_ITERATIONS = 8;
    private static final int P_ITERATIONS = 3;
    private static final double MILLIS = 1000.0;

    /* World */
    private static final float WIDTH = 50f;
    private static final float HEIGHT = 70f;
    private static final float THICKNESS = 0.1f;
    private static final Vec2 GRAVITY = new Vec2(0, -60f);
    private static final Rectangle2D VIEW =
        new Rectangle2D.Float(-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
    private static final long FLIP_RATE = 3500L;

    /* Balls */
    private static final int BALLS = 150;
    private static final float BALL_RADIUS = 0.75f;
    private static final float BALL_DENSITY = 1f;
    private static final float BALL_FRICTION = 0f;
    private static final float BALL_RESTITUTION = 0.4f;

    private static final float SPIKE_THICKNESS = 12f;
    private static final float SPIKE_EXTENT = 20f;

    @Getter private final World world;
    private boolean running = false;
    private static final ScheduledExecutorService EXEC =
        Executors.newSingleThreadScheduledExecutor();

    /**
     * Create a new bottle.
     */
    public Bottle() {
        world = new World(GRAVITY, false);
        /* Set up the containment box. */
        buildContainer();

        /* Add a ball. */
        Random rng = new Random();
        for (int i = 0; i < BALLS; i++) {
            addBall((rng.nextFloat() - 0.5f) * (WIDTH - BALL_RADIUS),
                    (rng.nextFloat() - 0.5f) * (HEIGHT - BALL_RADIUS));
        }
        addSpike(SPIKE_EXTENT, 0, 1);
        addSpike(-SPIKE_EXTENT, 0, -1);
        EXEC.scheduleAtFixedRate(new Runnable() {
                public void run() {
                    if (running) {
                        world.step(1f / FPS, V_ITERATIONS, P_ITERATIONS);
                        setChanged();
                        notifyObservers();
                        if (System.currentTimeMillis() / FLIP_RATE % 2 == 0) {
                            world.setGravity(GRAVITY.negate());
                        } else {
                            world.setGravity(GRAVITY);
                        }
                    }
                }
            }, 0L, (long) (MILLIS / FPS), TimeUnit.MILLISECONDS);
    }

    /**
     * Run the simulation.
     */
    public final void start() {
        running = true;
    }

    /**
     * Stop the simulation, which can be restarted again.
     */
    public final void stop() {
        running = false;
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
     */
    private void buildContainer() {
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
     * @param x      the x-coordinate of the ball
     * @param y      the y-coordinate of the ball
     */
    private void addBall(final float x, final float y) {
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

    /**
     * Add a static spike to the bottle.
     * @param x    x-position of the point
     * @param y    y-position of the point
     * @param dir  direction of the point
     */
    private void addSpike(final float x, final float y, final int dir) {
        BodyDef def = new BodyDef();
        def.position = new Vec2(x, y);
        PolygonShape shape = new PolygonShape();
        Vec2[] vecs = new Vec2[3];
        int side = 1;
        vecs[0] = new Vec2(dir * WIDTH / 2 - x, dir * SPIKE_THICKNESS / 2f);
        vecs[1] = new Vec2(0, 0);
        vecs[2] = new Vec2(dir * WIDTH / 2 - x, dir * -SPIKE_THICKNESS / 2f);
        shape.set(vecs, vecs.length);
        FixtureDef fix = new FixtureDef();
        fix.shape = shape;
        fix.density = 0f;
        fix.friction = 0f;
        world.createBody(def).createFixture(fix);
    }
}
