package liquid;

import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JPanel;
import lombok.val;

/**
 * Control panel for a bottle and viewer.
 */
public final class Controls extends JPanel {

    private static final long serialVersionUID = 1L;
    private static final int GAP = 10;

    private final Bottle bottle;
    private final Viewer viewer;

    /**
     * Create a new control panel for the given bottle and viewer.
     * @param bottle  the bottle to be controlled
     * @param viewer  the viewer to be controlled
     */
    public Controls(final Bottle bottle, final Viewer viewer) {
        this.bottle = bottle;
        this.viewer = viewer;

        val layout = new GridLayout(2, 2);
        layout.setHgap(GAP);
        layout.setVgap(GAP);
        setLayout(layout);
        setBorder(BorderFactory.createEmptyBorder(0, GAP, GAP, GAP));

        val threshold = new JCheckBox("Threshold", true);
        threshold.addActionListener(new ActionListener() {
                public void actionPerformed(final ActionEvent e) {
                    viewer.setThreshold(threshold.isSelected());
                }
            });
        add(threshold);

        val blur = new JCheckBox("Blur", true);
        blur.addActionListener(new ActionListener() {
                public void actionPerformed(final ActionEvent e) {
                    viewer.setBlur(blur.isSelected());
                    threshold.setEnabled(blur.isSelected());
                }
            });
        add(blur);

        val pause = new JButton("Pause");
        pause.addActionListener(new ActionListener() {
                public void actionPerformed(final ActionEvent e) {
                    if (bottle.isRunning()) {
                        bottle.stop();
                        pause.setText("Play");
                    } else {
                        new Thread(bottle).start();
                        pause.setText("Pause");
                    }
                }
            });
        add(pause);
    }
}
