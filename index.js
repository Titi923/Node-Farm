const fs = require('fs');
const http = require('http');
const url = require('url');

////////////////////////////////////////////////
// FILES

// const fs = require('fs');
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2);
//     fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
//       console.log(data3);
//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', (err) => {
//         console.log('File Written');
//       });
//     });
//   });
// });

////////////////////////////////////////////////
// SERVER
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCT_NAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic) {
    output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
  }

  // And do not forget to output the final html.
  return output;
};

const server = http.createServer((req, res) => {
  const pathName = req.url;

  // Templates Read
  const tempOverview = fs.readFileSync(
    `${__dirname}/templates/template-overview.html`,
    'utf-8'
  );
  const tempProduct = fs.readFileSync(
    `${__dirname}/templates/template-product.html`,
    'utf-8'
  );
  const tempCard = fs.readFileSync(
    `${__dirname}/templates/template-card.html`,
    'utf-8'
  );

  // Read the data JUST once and then anytime you to code will just use it, without reading it on every request
  const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
  const dataObj = JSON.parse(data);

  const { query, pathname } = url.parse(req.url, true);

  // Overview Page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj
      .map((el) => {
        return replaceTemplate(tempCard, el);
      })
      .join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml); // tempOverview now is a string that holds the overview HTML
    res.end(output);

    // Product Page
  } else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' }); // This is for the json files
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html', // Inform the browser about the Content-type and the browser will expect what you informed here
      'my-own-custom-header': 'hello-world!!!', // You can also create custom headers
    });
    res.end('<h1>Page not found!</h1>'); // Because you informed about the Content-type as html now you can write html
  }
});

// Start the server
server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
