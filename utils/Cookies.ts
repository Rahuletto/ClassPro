import Storage from "./Storage";

export const Cookie = {
  clear() {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(";");
    localStorage.clear();
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  },

  set(name: string, value: string, expirationMonths: number = 3) {
    if (typeof document === 'undefined') return null;

    const exdate = new Date();
    exdate.setMonth(exdate.getMonth() + expirationMonths);
  
    const encodedValue = encodeURIComponent(value);
  
    const cookieString = `${name}=${encodedValue}; expires=${exdate.toUTCString()}; path=/; ${
      window.location?.hostname === 'localhost' ? '' : 'Secure; '
    }SameSite=Lax`;
  
    document.cookie = cookieString;

    Storage.set(name, value);
    return true;
  },

  get(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return Storage.get(name, null);
  },
};

export function getCookie(cookie: string, name: string) {
  // const regex = new RegExp(`(^| )${name}=([^;]+)`);
  // const match = cookie.match(regex);
  // if (match) {
  //   return match[2];
  // }
  return cookie;
}