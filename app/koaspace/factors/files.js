/** FileScanOption Props
 * @prop filterDirs : string[]
 */
function FileScanOption({ filterDirs = [] }) {
  return {
    filterDirs
  };
}
/** FileStatProp
 * @prop filePath: string
 * @prop filename: string
 * @prop filesize: number
 * @prop counter: number
 * @prop filectime: Date
 * @prop filemtime: Date
 */
function FileStatProps({
  filePath,
  filename,
  filesize,
  counter = 0,
  filectime,
  filemtime
}) {
  return {
    filePath,
    filename,
    filesize,
    counter,
    filectime,
    filemtime
  };
}

module.exports = {
  FileScanOption,
  FileStatProps
};
