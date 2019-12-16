describe("Pixelmatch integration with jasmine", function() {
  it("notices different images", async () => {
    let refData = imgToData(await loadImage("img/first.png"));
    let changedData = imgToData(await loadImage("img/second.png"));
    let differingPixels = pixelmatch(
      refData.data,
      changedData.data,
      null,
      refData.width,
      refData.height
    );
    expect(differingPixels).toBeGreaterThan(0);
  });

  it("notices the same images", async () => {
    let imgData = imgToData(await loadImage("img/first.png"));
    let differingPixels = pixelmatch(
      imgData.data,
      imgData.data,
      null,
      imgData.width,
      imgData.height
    );
    expect(differingPixels).toBe(0);
  });
});
