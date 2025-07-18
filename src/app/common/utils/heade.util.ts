import { HttpHeaders } from "@angular/common/http";
import { retrieveObjectFromStorage, retrieveStringFromStorage } from "./storage.util";

export function buildHeader(contentType?: string): HttpHeaders {
  let headers: HttpHeaders = new HttpHeaders()
    .set("Content-Type", contentType ? contentType : "application/json")
    .set("Authorization", "Bearer " + retrieveStringFromStorage("TokenAuthorization"))
    .set("Company", retrieveObjectFromStorage("TCompany")?.identifier || "");

  return headers;
}

export function buildHeaderWithOutCompany(contentType?: string): HttpHeaders {
  let headers: HttpHeaders = new HttpHeaders()
    .set("Content-Type", contentType ? contentType : "application/json")
    .set("Authorization", "Bearer " + retrieveStringFromStorage("TokenAuthorization"));

  return headers;
}

export function buildHeaderWithOutAuthorization(contentType?: string): HttpHeaders {
  let headers: HttpHeaders = new HttpHeaders()
    .set("Content-Type", contentType ? contentType : "application/json");

  return headers;
}
