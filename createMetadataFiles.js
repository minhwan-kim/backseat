const fs = require('fs');
const path = require('path');

// Read existing projects.json
const projectsPath = path.join(__dirname, 'projects.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

console.log(`Creating metadata.json files for ${projects.length} projects...\n`);

projects.forEach((project, index) => {
  const projectFolder = project.folder;
  const projectPath = path.join(__dirname, projectFolder);

  if (!fs.existsSync(projectPath)) {
    console.log(`⚠️  Skipping ${projectFolder} - folder not found`);
    return;
  }

  // Create metadata object
  const metadata = {
    title: project.title,
    date: project.date,
    defaultCaption: project.images[0]?.caption || project.title
  };

  // Check if images have different captions
  const captions = {};
  let hasCustomCaptions = false;

  project.images.forEach(img => {
    const fileName = path.basename(img.src);
    const caption = img.caption;

    // Only add to captions object if it's different from default
    if (caption !== metadata.defaultCaption) {
      captions[fileName] = caption;
      hasCustomCaptions = true;
    }
  });

  // Only include captions object if there are custom captions
  if (hasCustomCaptions) {
    metadata.captions = captions;
  }

  // Write metadata.json
  const metadataPath = path.join(projectPath, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  console.log(`✓ Created ${projectFolder}/metadata.json`);
});

console.log('\n✅ All metadata.json files created successfully!');
console.log('\nNext steps:');
console.log('1. Review the metadata.json files in each project folder');
console.log('2. Run: node generateProjectsJson.js');
console.log('3. The system will now use metadata.json instead of preserving old data');
