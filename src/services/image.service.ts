import axios from "axios";
import { API_BASE_URL, ServerError, STATUS_CODE } from "../config";
import { Service } from "@/services/service";
import { Image } from "@/models/image";
import { Annotation } from "@/models/annotation";
import { Label } from "@/models/label";
const API_URL = API_BASE_URL + "/image/";

class ImageService extends Service {
  async fetchImages(): Promise<Image[]> {
    console.log("image.service.fetchImages start");
    const headers = this.getHeader();
    const response = await axios.get(API_URL + "list", {
      headers: headers
    });

    console.log("응답" + response.data)

    if (response.data.status == STATUS_CODE.SUCCESS) {
      const images: Image[] = [];
      for (const d in response.data.images) {
        images.push(Image.buildFromObject(response.data.images[d]));
      }
      console.log("image.service.fetchImages success, nimages = " + images.length);
      return images;
    } else {
      console.log("image.service.fetchImages failed with status = " + response.data.status);
      throw new ServerError(API_URL + "list", response.data.status);
    }
  }

  async fetchLabels(): Promise<Label[]> {
    const headers = this.getHeader();
    const response = await axios.get(API_URL + "annotation_labels", {
      headers: headers
    });
    if (response.data.status == STATUS_CODE.SUCCESS) {
      const labels: Label[] = [];
      for (const d of response.data.labels) {
        labels.push(Label.buildFromObject(d));
      }
      return labels;
    } else {
      throw new ServerError(API_URL + "list", response.data.status);
    }
  }

  async fetchAnnotations(img: Image): Promise<Annotation[]> {
    const headers = this.getHeader();
    const response = await axios.get(API_URL + "annotations/" + img.id, {
      headers: headers
    });
    if (response.data.status == STATUS_CODE.SUCCESS) {
      const annotations: Annotation[] = [];
      for (const d of response.data.annotations) {
        annotations.push(Annotation.buildFromObject(d));
      }
      return annotations;
    } else {
      throw new ServerError(API_URL + "list", response.data.status);
    }
  }
}

export default new ImageService();
