import * as path from "path";
import { countFiles } from "../index";

describe("test", () => {
  test("count custom fs one file", async () => {
    const targetPath = path.join(__dirname, "fixtures/1.txt");
    const actual = await countFiles(targetPath);
    expect(actual).toEqual({
      files: 1,
      dirs: 0,
      bytes: 1,
    });
  });

  test("count nest dir", async () => {
    const dirPath = path.join(__dirname, "fixtures/nest");
    const dirResult = await countFiles(dirPath);
    expect(dirResult).toEqual({
      files: 2,
      dirs: 1,
      bytes: 4 + 5,
    });
  });

  test("ignore dot file", async () => {
    const dirPath = path.join(__dirname, "fixtures/dir2");
    const dirResult = await countFiles(dirPath);
    const expected = {
      files: 1,
      dirs: 0,
      bytes: 3,
    };
    expect(dirResult).toEqual(expected);

    const filePath = path.join(__dirname, "fixtures/dir2/3.txt");
    const fileResult = await countFiles(filePath);
    expect(fileResult).toEqual(expected);
  });
});
