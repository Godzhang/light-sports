import axios from "axios";
import rawjsonp from "jsonp";
import { formatUrl } from "@/common/utils/utils";

const baseURL = process.env.NODE_ENV === "production" ? "/api/v1/2019ncov" : "";
const instance = axios.create({ baseURL });
instance.interceptors.response.use(
  ({ data }) => data,
  err => Promise.reject(err)
);
export const get = (url, param = {}, opt = {}) => {
  const u = formatUrl(url, param, opt);
  return instance.get(u);
};
export const post = (url, param = {}, opt = {}) =>
  instance.post(url, param, opt);
export const postFormData = (url, param = {}, opt = {}) => {
  opt = Object.assign(
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    },
    opt
  );
  const fd = new FormData();
  Object.keys(param).forEach(k => fd.append(k, param[k]));
  return instance.post(url, fd, opt);
};
export const jsonp = (url, param = {}, opt = {}) => {
  const u = formatUrl(url, param);
  return new Promise((resolve, reject) => {
    rawjsonp(u, opt, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
export const loadScript = url =>
  new Promise((resolve, reject) => {
    const scripts = document.querySelectorAll("script");
    const srcs = [].map.call(scripts, el => el.src).reverse();
    if (srcs.includes(url)) {
      resolve();
    }
    const tag = document.createElement("script");
    tag.src = url;
    tag.onload = resolve;
    tag.onerror = reject;
    document.body.appendChild(tag);
  });
