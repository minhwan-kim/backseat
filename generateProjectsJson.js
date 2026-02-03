const fs = require('fs');
const path = require('path');

// Path to your images folder
const projectsFolder = path.join(__dirname, 'images');
// Path to JSON file
const jsonPath = path.join(__dirname, 'projects.json');

// Function to get existing data if available
let existingProjects = [];
if (fs.existsSync(jsonPath)) {
  try {
    existingProjects = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (e) {
    console.error("Error reading projects.json, using empty array.", e);
    existingProjects = [];
  }
}

// Helper: Given a folder name, find the corresponding project in existingProjects
function findExistingProject(folderName) {
  return existingProjects.find(proj => path.basename(proj.folder) === folderName);
}

// Helper: Read metadata.json from project folder if it exists
function readMetadata(projectPath) {
  const metadataPath = path.join(projectPath, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    try {
      return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch (e) {
      console.error(`Error reading metadata.json in ${projectPath}:`, e);
      return null;
    }
  }
  return null;
}

// Read all directories in the images folder
fs.readdir(projectsFolder, { withFileTypes: true }, (err, dirents) => {
  if (err) {
    console.error('Error reading projects folder:', err);
    return;
  }

  // Filter directories (excluding Global folder) and sort naturally
  const sortedDirs = dirents
    .filter(dirent => dirent.isDirectory() && dirent.name.toLowerCase() !== 'global')
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const projects = [];
  sortedDirs.forEach((dirent, index) => {
    const projectFolder = dirent.name;
    const projectPath = path.join(projectsFolder, projectFolder);
    let files = fs.readdirSync(projectPath);

    // Filter out thumb.jpg, metadata.json, and hidden files
    const imageFiles = files.filter(file =>
      file.toLowerCase() !== 'thumb.jpg' &&
      file.toLowerCase() !== 'metadata.json' &&
      file[0] !== '.'
    );
    // Sort image files (alphabetically)
    imageFiles.sort();

    // Read metadata.json if it exists
    const metadata = readMetadata(projectPath);

    // Map image files into objects with captions
    const images = imageFiles.map(file => {
      let caption = `${projectFolder} - ${file}`;

      // If metadata exists, use caption from there
      if (metadata) {
        // Check for specific caption for this file
        if (metadata.captions && metadata.captions[file]) {
          caption = metadata.captions[file];
        } else if (metadata.defaultCaption) {
          // Use default caption if specific one not found
          caption = metadata.defaultCaption;
        }
      }

      return {
        src: path.join('images', projectFolder, file),
        caption: caption
      };
    });

    // Determine title and date
    let title = projectFolder;
    let date = "";
    let cmsExtraData = {}; // Any additional fields you want to preserve

    // Priority 1: Use metadata.json if it exists
    if (metadata) {
      title = metadata.title || projectFolder;
      date = metadata.date || "";
      // Preserve any extra fields from metadata
      const { title: _, date: __, captions: ___, defaultCaption: ____, ...extras } = metadata;
      cmsExtraData = extras;
    } else {
      // Priority 2: Check for existing project data (old behavior)
      const existing = findExistingProject(projectFolder);
      if (existing) {
        // If the folder exists and the list of image sources hasn't changed, keep the existing title/date/captions.
        const existingImageSrcs = existing.images.map(img => img.src).join(",");
        const newImageSrcs = images.map(img => img.src).join(",");
        if (existingImageSrcs === newImageSrcs) {
          title = existing.title;
          date = existing.date;
          // You can also copy over any additional fields
          cmsExtraData = { ...existing };
        }
      }
    }

    // Create project data
    projects.push({
      number: index + 1, // plain number for website
      title: title,
      date: date,
      folder: path.join('images', projectFolder),
      thumb: path.join('images', projectFolder, 'thumb.jpg'),
      images: images,
      // Optionally, add any extra fields from existing data that you want to preserve:
      ...cmsExtraData
    });
  });

  // Write the merged projects data to projects.json
  fs.writeFileSync(jsonPath, JSON.stringify(projects, null, 2));
  console.log('projects.json has been generated successfully.');
});
