import { Annotation } from "./annotation";
import { User } from "../../auth/models/user";

export class Image {
  private static readonly IMAGES_KEY = "images";
  /**
   * Build image object from JSON
   * @param data image data object
   */
  static buildFromObject(data: object, token: string): Image {
    const img = new Image();
    img.id = data["id"];
    img.originalName = data["originalName"];
    img.imageUrl = data["imageUrl"] + "?token=" + token;
    img.thumbnailUrl = data["thumbnailUrl"] + "?token=" + token;
    img.createdAt = data["createdAt"];
    img.updatedAt = data["updatedAt"];
    return img;
  }

  static loadImagesFromLocalStorage(): Image[] {
    const imagedata = localStorage.getItem(Image.IMAGES_KEY);
    const user = User.buildFromLocalStorage();
    if (imagedata) {
      const json = JSON.parse(imagedata);
      const images: Image[] = [];
      for (const i in json) {
        images.push(Image.buildFromObject(json[i], user.accessToken));
      }
      return images;
    } else {
      return [];
    }
  }
  id: string = "";
  originalName: string = "";
  imageUrl: string = "";
  thumbnailUrl: string = "";
  createdAt: string = "";
  updatedAt: string = "";
  annotations: Annotation[] = [];

  formatCreatedAt() {
    if (!this.createdAt) {
      return "";
    }
    const t = Date.parse(this.createdAt);
    const d = new Date(t);
    return d.toLocaleString();
  }

  formatUpdatedAt() {
    if (!this.updatedAt) {
      return "";
    }
    const t = Date.parse(this.updatedAt);
    const d = new Date(t);
    return d.toLocaleString();
  }
}
