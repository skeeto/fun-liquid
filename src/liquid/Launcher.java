package liquid;

import javax.swing.BoxLayout;
import javax.swing.JFrame;
import lombok.val;

/**
 * Sets up the environment and drives the simulation forward.
 */
public final class Launcher {

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
        /* Fix for poor OpenJDK performance. */
        System.setProperty("sun.java2d.pmoffscreen", "false");

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
        bottle.run();
    }
}
