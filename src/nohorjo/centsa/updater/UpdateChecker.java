package nohorjo.centsa.updater;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.apache.commons.configuration.ConfigurationException;
import org.apache.commons.configuration.PropertiesConfiguration;

import com.fasterxml.jackson.databind.ObjectMapper;

import javafx.application.Platform;
import nohorjo.centsa.properties.SystemProperties;

/**
 * Class to handle checking for and initating updates
 * 
 * @author muhammed
 *
 */
public class UpdateChecker {

	private static final PropertiesConfiguration updateProperties = new PropertiesConfiguration();
	private static final String UPDATER_DIR = SystemProperties.get("root.dir", String.class) + "/updater";

	private static boolean shouldRestart;

	static {
		// Adds shutdown hook to launch updater
		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			if (new File(UPDATER_DIR).listFiles((f) -> {
				return f.getName().endsWith(".zip");
			}).length > 0) {
				// Zip file exists - run updater
				// TODO run updater
			}
		}));
		try (InputStream in = ClassLoader.getSystemResourceAsStream("update.properties")) {
			updateProperties.load(in);
		} catch (IOException | ConfigurationException e) {
			throw new Error(e);
		}
	}

	/**
	 * Checks Github for a new release
	 * 
	 * @return Info on the latest version or <code>null</code> if this is the latest
	 * @throws IOException
	 */
	@SuppressWarnings("unchecked")
	public static UpdateInfo checkNewVersion() throws IOException {
		UpdateInfo info;
		// Connect to Github's REST API
		HttpURLConnection conn = (HttpURLConnection) new URL(updateProperties.getString("latest.url")).openConnection();
		conn.setRequestMethod("GET");
		try (InputStream in = conn.getInputStream()) {
			info = new UpdateInfo();
			Map<String, ?> resp = new ObjectMapper().readValue(in, HashMap.class);

			String versionInfo[] = resp.get("tag_name").toString().substring(1).split(Pattern.quote("."));

			info.setMajorVersion(Integer.parseInt(versionInfo[0]));
			info.setMinorVersion(Integer.parseInt(versionInfo[1]));

			if (info.getMajorVersion() == updateProperties.getInt("major.version")
					&& info.getMinorVersion() == updateProperties.getInt("minor.version")) {
				return null; // This is the latest
			}

			String[] changelog = resp.get("body").toString().split("\\r\\n");

			for (int i = 0; i < changelog.length; i++) {
				// Remove the '- ' at the beginning as this was used for markdown
				changelog[i] = changelog[i].replaceAll("^- ", "");
			}

			info.setChangelog(changelog);
			info.setAsset((((List<Map<String, ?>>) resp.get("assets")).get(0)).get("browser_download_url").toString());
		}
		return info;
	}

	/**
	 * Gets the current version
	 * 
	 * @return v[major].[minor]
	 */
	public static String getCurrentVersion() {
		return "v" + updateProperties.getInt("major.version") + "." + updateProperties.getInt("minor.version");
	}

	/**
	 * Downloads new zip and deletes old ones
	 * 
	 * @param info
	 *            The update to download
	 * @throws IOException
	 */
	public static void downloadUpdate(UpdateInfo info) throws IOException {
		File zip = new File(UPDATER_DIR + "/" + info.getAssetName());
		if (zip.createNewFile()) {
			HttpURLConnection conn = (HttpURLConnection) new URL(info.getAsset()).openConnection();
			conn.setRequestMethod("GET");
			try (InputStream in = conn.getInputStream(); OutputStream out = new FileOutputStream(zip)) {
				int b;
				while ((b = in.read()) != -1) {
					out.write(b);
				}
			}
			for (File old : zip.getParentFile().listFiles((f) -> {
				return f.getName().endsWith(".zip") && !f.getName().equals(zip.getName());
			})) {
				Files.delete(old.toPath());
			}
		}
	}

	/**
	 * Sets restart flag and kills the application
	 */
	public static void launchUpdaterAndRestart() {
		shouldRestart = true;
		Platform.exit();
		System.exit(0);
	}

}
