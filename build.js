

const fs = require('fs-extra');

const copyFiles = build_path => {
  let dest_dir = `${build_path}/src`
  fs.ensureDirSync(dest_dir)

  for (let p of ["package.json", "src", "tsconfig.json", "yarn.lock", "public"]) {
    fs.copy(p, `${dest_dir}/${p}`)
  }

};

if (require.main === module) {
  copyFiles("'./build'");
}

