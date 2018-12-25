import {HttpService} from "../services/http.service";

export function imagePathFixer(imgSrc: string, productId: string, colorId: string): string {
  return imgSrc ? imgSrc.includes(HttpService.Host) ? imgSrc :
    [HttpService.Host, HttpService.PRODUCT_IMAGE_PATH, productId, colorId, imgSrc].join("/") : "";
}
