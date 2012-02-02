package liquid;

import javax.swing.BoxLayout;
import javax.swing.JApplet;
import lombok.val;

/**
 * Run the simulation as an applet.
 */
public class LiquidApplet extends JApplet {
    private static final long serialVersionUID = 1L;

    private Bottle bottle;
    private Viewer viewer;

    @Override
    public final void init() {
        bottle = new Bottle();
        viewer = new Viewer(bottle);
        val layout = new BoxLayout(getContentPane(), BoxLayout.Y_AXIS);
        setLayout(layout);
        add(viewer);
        add(new Controls(bottle, viewer));
    }

    @Override
    public final void start() {
        new Thread(bottle).start();
    }

    @Override
    public final void stop() {
        bottle.stop();
    }
}
