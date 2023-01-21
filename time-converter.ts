import "@johnlindquist/kit";

let timezones = await get(
  "https://www.timeapi.io/api/TimeZone/AvailableTimeZones"
);
const date = new Date();

const day = date.getDate();
const month = date.getMonth() + 1; // getMonth() returns month from 0 to 11
const year = date.getFullYear();

const today = `${year}-${String(month).padStart(2, "0")}-${day} `;

let response = await post(
  "https://www.timeapi.io/api/Conversion/ConvertTimeZone",
  {
    fromTimeZone: "Asia/Singapore",
    dateTime: today + (await arg("Input time e.g. 17:45")) + ":00",
    toTimeZone: await arg("Select a timezone", timezones.data),
    dstAmbiguity: "",
  }
);

await div(
  `<div class="text-center text-2xl m-16">${String(
    response.data.conversionResult.dateTime
  )}</div>`
);
