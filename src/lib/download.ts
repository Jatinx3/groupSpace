export async function downloadFile(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;

    // Append to body, click, and clean up
    document.body.appendChild(link);
    link.click();
    
    // Revoke the object URL to free memory
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    }, 100);
  } catch (error) {
    console.error("Download failed:", error);
    // You could also add a toast notification here if you have one available
  }
}
