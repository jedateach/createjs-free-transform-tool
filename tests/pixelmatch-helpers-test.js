describe("Pixelmatch integration with jasmine", function() {
  it("notices different images", async () => {
    let refData = imgToImageData(await loadImage("img/first.png"));
    let changedData = imgToImageData(await loadImage("img/second.png"));

    expect(refData).not.toEqual(changedData);
    expect(refData).not.toVisuallyEqual(changedData);
  });

  it("notices the same images", async () => {
    let imgData = imgToImageData(await loadImage("img/first.png"));

    expect(imgData).toEqual(imgData);
    expect(imgData).toVisuallyEqual(imgData);
  });
});
