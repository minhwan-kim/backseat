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

// Read all directories in the images folder
fs.readdir(projectsFolder, { withFileTypes: true }, (err, dirents) => {
  if (err) {
    console.error('Error reading projects folder:', err);
    return;
  }

  // Filter directories and sort naturally
  const sortedDirs = dirents
    .filter(dirent => dirent.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  const projects = [];
  sortedDirs.forEach((dirent, index) => {
    const projectFolder = dirent.name;
    const projectPath = path.join(projectsFolder, projectFolder);
    let files = fs.readdirSync(projectPath);

    // Filter out thumb.jpg and hidden files
    const imageFiles = files.filter(file => file.toLowerCase() !== 'thumb.jpg' && file[0] !== '.');
    // Sort image files (alphabetically)
    imageFiles.sort();

    // Map image files into objects
    const images = imageFiles.map(file => ({
      src: path.join('images', projectFolder, file),
      caption: `${projectFolder} - ${file}`
    }));

    // Check for existing project data
    const existing = findExistingProject(projectFolder);
    let title = projectFolder;
    let date = "";
    let cmsExtraData = {}; // Any additional fields you want to preserve

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
