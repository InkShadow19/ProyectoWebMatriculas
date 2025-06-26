export function saveStringOnStorage(model_name: string, value: string): void {
  localStorage.setItem(model_name, value);
}

export function retrieveStringFromStorage(model_name: string): string {
  return localStorage.getItem(model_name) || "";
}

export function saveObjectOnStorage(model_name: string, model: any): void {
  localStorage.setItem(model_name, btoa(JSON.stringify(model)));
}

export function saveObjectOnStoragePreRemove(model_name: string, model: any): void {
  localStorage.removeItem(model_name);
  localStorage.setItem(model_name, btoa(JSON.stringify(model)));
}

export function retrieveObjectFromStorage(model_name: string): any {
  const storageData = localStorage.getItem(model_name)
  if (storageData) {
    try {
      return JSON.parse(atob(storageData));
    } catch (error) { }
  }
  return null
}

export function removeStringFromStorage(model_name: string): void {
  localStorage.removeItem(model_name);
}

export function setAppToken(model_name: string, value: string) {
  if (value == null) {
    removeStringFromStorage(model_name);
  }
  else {
    saveStringOnStorage(model_name, value);
  }
}


export function clearStorage(): void {
  sessionStorage.clear();
  localStorage.clear();
}
