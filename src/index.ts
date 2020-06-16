import * as fs from "fs";
import * as path from "path";

type TotalStats = {
  files: number;
  dirs: number;
  bytes: number;
};

type CountCallBack = (
  err: null | NodeJS.ErrnoException,
  totalStats: TotalStats
) => void;

export const countFiles = (filePath: string): Promise<TotalStats> => {
  const totalStats: TotalStats = {
    files: 0,
    dirs: 0,
    bytes: 0,
  };

  const countFile = (filePath: string, cb: CountCallBack) => {
    fs.lstat(filePath, (err, st) => {
      if (err) return cb(err, totalStats);
      totalStats.files++;
      totalStats.bytes += st.size;
      cb(null, totalStats);
    });
  };

  const count = (filePath: string, cb: CountCallBack) => {
    const actualPath = path.resolve(filePath);
    fs.readdir(actualPath, (err, list) => {
      if ((err && err.code === "ENOTDIR") || !list || !list.length)
        return countFile(actualPath, cb);
      if (err) return cb(err, totalStats);

      let pending = list.length;
      if (!pending) return cb(null, totalStats);
      list.forEach((listFilePath) => {
        const actualListFilePath = path.resolve(actualPath, listFilePath);
        if (path.basename(listFilePath).startsWith(".")) {
          if (!--pending) cb(null, totalStats);
          return;
        }

        fs.lstat(actualListFilePath, (err, st) => {
          if (err) return cb(err, totalStats);
          if (st && st.isDirectory()) {
            totalStats.dirs++;
            count(actualListFilePath, (err) => {
              if (err) {
                cb(err, totalStats);
                return;
              }
              if (!--pending) cb(null, totalStats);
            });
          } else {
            totalStats.files++;
            if (st) totalStats.bytes += st.size;
            if (!--pending) cb(null, totalStats);
          }
        });
      });
    });

    return totalStats;
  };

  return new Promise((resolve, reject) => {
    count(filePath, (err, totalStats) => {
      if (err != null) return reject(err);
      resolve(totalStats);
    });
  });
};
