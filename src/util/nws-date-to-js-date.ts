export default function NWSDateToJSDate(nwsdate: string): Date | string {
  let jsdate: Date
  if (Number.isNaN(Date.parse(nwsdate))) {
    return nwsdate
  } else {
    jsdate = new Date(nwsdate)
    return `${jsdate.toLocaleDateString()} ${jsdate.toLocaleTimeString()}`
  }
}
