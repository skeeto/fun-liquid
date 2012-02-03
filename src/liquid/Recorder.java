package liquid;

import java.awt.image.BufferedImage;
import java.io.File;
import java.util.Observable;
import java.util.Observer;
import javax.imageio.ImageIO;
import lombok.extern.java.Log;
import lombok.val;

/**
 * Latches onto a Viewer and records each frame of the
 * simulation. These frames can be later reassembled into a video
 * file.
 */
@Log
public class Recorder implements Observer {

    private final Viewer viewer;
    private long counter = 0;
    private static final String PREFIX = "frame-";

    /**
     * Make a new recorder that follows the given viewer.
     * @param viewer  the viewer to record
     */
    public Recorder(final Viewer viewer) {
        this.viewer = viewer;
        viewer.getBottle().addObserver(this);
    }

    @Override
    public final void update(final Observable o, final Object arg) {
        val image = new BufferedImage(viewer.getWidth(), viewer.getHeight(),
                                      BufferedImage.TYPE_INT_RGB);
        val g = image.createGraphics();
        viewer.paintComponent(g);
        g.dispose();
        val file = new File(String.format("%s%08d.png", PREFIX, counter++));
        try {
            ImageIO.write(image, "PNG", file);
        } catch (java.io.IOException e) {
            log.severe("Could not write image " + file);
        }
    }
}
