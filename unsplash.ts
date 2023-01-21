// Name: Unsplash
// Description: Search unsplash for the perfect image to download
// Author: Vogelino
// Twitter: @soyvogelino

import "@johnlindquist/kit";
const { createApi } = await npm("unsplash-js");

const accessKey = await env(
  "yD-KTxmsMvpi7hSLCqesXfYRg03wPGq5ZfSoabRWCxg",
  "Enter your unsplash Access Key"
);

const downloadPath = await env(
  "UNSPLASH_DOWNLOAD_PATH",
  "Enter the path where to download the images"
);

const headers = {
  "User-Agent": "scriptkit/unsplash",
};

const api = createApi({
  accessKey,
});

const query = await arg("What do you want to search");
const photosRes = await api.search.getPhotos({
  query,
  page: 1,
  perPage: 10,
});

if (photosRes.errors) {
  console.log("error occurred: ", photosRes.errors[0]);
} else {
  const { results } = photosRes.response;
  const options = results.map((photo) => ({
    name: photo.description || photo.alt_description || "Untitled",
    description: `${photo.user.name} – ${photo.width} x ${photo.height} – ${photo.likes} Likes`,
    preview: `
      <style>.image { object-fit: contain; height: 80vh; }</style>
      <img class="w-screen image" src="${photo.urls.regular}" />
    `,
    value: photo,
  }));
  const selectedPhoto = await arg("Select a photo to copy", options);

  const buffer = await download(selectedPhoto.urls.raw, headers);
  const filePath = `${downloadPath}/unsplash-image-${selectedPhoto.id}.png`;
  await writeFile(filePath, buffer);
  notify(`Successfully downloaded file: ${filePath}`);
}
