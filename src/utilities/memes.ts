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

  const { data, errors } = await resp.json();
  if (resp.ok) {
    return data.images.original.url;
  } else {
    throw new Error(errors);
  }
}
