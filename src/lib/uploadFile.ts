export async function uploadFile(file: File, uploadUrl: string): Promise<string> {
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const { storageId } = await res.json();
  return storageId;
}
