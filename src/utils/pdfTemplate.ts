import PDFDocument from "pdfkit";

// create a document and pipe to a blob
var doc = new PDFDocument();
// draw some text
doc.fontSize(25).text("Here is some vector graphics...", 100, 80);

// some vector graphics
doc.save().moveTo(100, 150).lineTo(100, 250).lineTo(200, 250).fill("#FF3300");

doc.circle(280, 200, 50).fill("#6600FF");

// an SVG path
doc
  .scale(0.6)
  .translate(470, 130)
  .path("M 250,75 L 323,301 131,161 369,161 177,301 z")
  .fill("red", "even-odd")
  .restore();

doc.save();
// a gradient fill
var gradient = doc
  .linearGradient(100, 300, 200, 300)
  .stop(0, "green")
  .stop(0.5, "red")
  .stop(1, "green");
doc.rect(100, 300, 100, 100).fill(gradient);

// stroke & fill uncolored tiling pattern

var stripe45d = doc.pattern(
  [1, 1, 4, 4],
  3,
  3,
  "1 w 0 1 m 4 5 l s 2 0 m 5 3 l s",
);
doc.circle(280, 350, 50).fill([stripe45d, "blue"]);

doc
  .rect(380, 300, 100, 100)
  .fillColor("lime")
  .strokeColor([stripe45d, "orange"])
  .lineWidth(5)
  .fillAndStroke();
doc.restore();

// and some justified text wrapped into columns
const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.";
doc
  .text("And here is some wrapped text...", 100, 450)
  .font("Times-Roman", 13)
  .moveDown()
  .text(lorem, {
    width: 412,
    align: "justify",
    indent: 30,
    columns: 2,
    height: 300,
    ellipsis: true,
  });

// end and display the document in the iframe to the right
doc.end();
