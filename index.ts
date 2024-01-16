let parseArgs = require('minimist');
let args = parseArgs(Bun.argv);

// console.log(args);

// if --file is passed in without an argument, defaults to true
if (!Object.keys(args).includes('file') || args.file == true) {
  console.log(`usage: remarkify --file file.md`);
  process.exit(1);
}

const mdFile = Bun.file(args.file);
const PORT = 4076;

try {
  const mdContent = await mdFile.text();
  const filePath = mdFile.name!.split('/');
  
  console.log(`hosting '${filePath[filePath?.length-1]}' as slides at http://localhost:${PORT}/`);

  Bun.serve({
    port: PORT,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/") {

        return new Response(renderDefault(mdContent), {
          headers: {
            "Content-Type": "text/html",
          },
        });
      } else {
        return new Response("404!");
      }
    },
  });
} catch (err) {
  console.error(err); 
}

function renderDefault(content: string) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Remarkify</title>
      <meta charset="utf-8">
      <style>
        @import url(https://fonts.googleapis.com/css?family=Yanone+Kaffeesatz);
        @import url(https://fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic);
        @import url(https://fonts.googleapis.com/css?family=Ubuntu+Mono:400,700,400italic);

        body { font-family: 'Droid Serif'; }
        h1, h2, h3 {
          font-family: 'Yanone Kaffeesatz';
          font-weight: normal;
        }
        .remark-code, .remark-inline-code { font-family: 'Ubuntu Mono'; }
      </style>
    </head>
    <body>
      <textarea id="source">

    ${content}

      </textarea>
      <script src="https://remarkjs.com/downloads/remark-latest.min.js">
      </script>
      <script>
        var slideshow = remark.create();
      </script>
    </body>
  </html>
  `
}
