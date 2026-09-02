const API_KEY = "9KNValB7h2YKToE3kHZ9HKQepPH9KqFY";

export async function GetRandomMemeByTag(tag: string): Promise<string> {
  const resp = await fetch(
    "https://api.giphy.com/v1/gifs/random?api_key=" +
      API_KEY +
      "&tag=" +
      tag +
      "&t=" +
      Date.now(),
  );

  const result = await resp.json();
  if (resp.ok && result?.data?.images?.original?.url) {
    return result.data.images.original.url;
  } else {
    throw new Error(result?.errors || "No meme found");
  }
}
