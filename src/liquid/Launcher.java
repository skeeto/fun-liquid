package liquid;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;
import com.beust.jcommander.ParameterException;
import javax.swing.BoxLayout;
import javax.swing.JFrame;
import lombok.extern.java.Log;
import lombok.val;

/**
 * Sets up the environment and drives the simulation forward.
 */
@Log
public final class Launcher {

    @Parameter(names = "-record", description = "Record the simulation.")
    private boolean record;

    /**
     * Private constructor.
     */
    private Launcher() {
    }

    /**
     * The main method, application entry point.
     * @param args  command line arguments
     */
    public static void main(final String[] args) {
        try {
            /* Fix for poor OpenJDK performance. */
            System.setProperty("sun.java2d.pmoffscreen", "false");
        } catch (java.security.AccessControlException e) {
            log.info("could not set sun.java2d.pmoffscreen");
        }

        /* Check the command line arguments. */
        val options = new Launcher();
        try {
            new JCommander(options, args);
        } catch (ParameterException e) {
            System.out.println("error: " + e.getMessage());
            new JCommander(options).usage();
            System.exit(-1);
        } catch (java.security.AccessControlException e) {
            log.warning("could not process arguments: " + e.getMessage());
        }

        /* Set up the frame. */
        JFrame frame = new JFrame("Fun Liquid");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        val layout = new BoxLayout(frame.getContentPane(), BoxLayout.Y_AXIS);
        frame.setLayout(layout);
        val bottle = new Bottle();
        val viewer = new Viewer(bottle);
        frame.add(viewer);
        frame.add(new Controls(bottle, viewer));
        frame.setResizable(false);
        frame.pack();
        frame.setVisible(true);
        if (options.record) {
            new Recorder(viewer);
        }

        /* Begin the simulation. */
        bottle.start();
    }
}
