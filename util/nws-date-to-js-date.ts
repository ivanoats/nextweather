export default function NWSDateToJSDate(nwsdate: string): Date | string {
  let jsdate: Date
  if (isNaN(Date.parse(nwsdate))) {
    return nwsdate
  } else {
    jsdate = new Date(nwsdate)
    return `${jsdate.toLocaleDateString()} ${jsdate.toLocaleTimeString()}`
  }
}
