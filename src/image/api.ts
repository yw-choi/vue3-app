import axios from "axios";
import { API_BASE_URL, ServerError, STATUS_CODE, getHeader } from "@/common/api.config";
import { Image } from "@/image/models/image";
import { Annotation } from "@/image/models/annotation";
import { Label } from "@/image/models/label";

const API_URL = API_BASE_URL + "/image/";

export async function fetchImages(): Promise<Image[]> {
  console.log("api/image/fetchImages(): start");
  const headers = getHeader();
  const response = await axios.get(API_URL + "list", {
    headers: headers
  });

  if (response.data.status == STATUS_CODE.SUCCESS) {
    const token = headers["x-access-token"] ?? "";
    const images: Image[] = [];
    for (const d in response.data.images) {
      images.push(Image.buildFromObject(response.data.images[d], token));
    }
    console.log("api/image/fetchImages(): success, nimages = ", images.length);
    return images;
  } else {
    console.log("api/image/fetchImages(): failure, status = ", response.data.status);
    throw new ServerError(API_URL + "list", response.data.status);
  }
}

export async function fetchLabels(): Promise<Label[]> {
  console.log("api/image/fetchLabels(): start");
  const headers = getHeader();
  const response = await axios.get(API_URL + "annotation_labels", {
    headers: headers
  });
  if (response.data.status == STATUS_CODE.SUCCESS) {
    const labels: Label[] = [];
    for (const d of response.data.labels) {
      labels.push(Label.buildFromObject(d));
    }
    console.log("api/image/fetchLabels(): success, nlabels = ", labels.length);
    return labels;
  } else {
    console.log("api/image/fetchLabels(): failure, status = ", response.data.status);
    throw new ServerError(API_URL + "annotation_labels", response.data.status);
  }
}

export async function fetchAnnotations(img: Image): Promise<Annotation[]> {
  console.log("api/image/fetchAnnotations(): start, img.id = ", img.id);
  const headers = getHeader();
  const response = await axios.get(API_URL + "annotations/" + img.id, {
    headers: headers
  });
  if (response.data.status == STATUS_CODE.SUCCESS) {
    const annotations: Annotation[] = [];
    for (const d of response.data.annotations) {
      annotations.push(Annotation.buildFromObject(d));
    }
    console.log("api/image/fetchAnnotations(): success, nannotations = ", annotations.length);
    return annotations;
  } else {
    console.log("api/image/fetchAnnotations(): failure, status = ", response.data.status);
    throw new ServerError(API_URL + "annotations/" + img.id, response.data.status);
  }
}

export async function pushAnnotations(img: Image, annotations: Annotation[]): Promise<Image> {
  const headers = getHeader();
  const json: any = [];
  for (const a of annotations) {
    json.push(a.toJson());
  }
  const response = await axios.post(API_URL + "annotations/" + img.id, json, {
    headers: headers
  });
  if (response.data.status == STATUS_CODE.SUCCESS) {
    const token = headers["x-access-token"] ?? "";
    return Image.buildFromObject(response.data.image, token);
  } else {
    console.log(response);
    throw new ServerError(API_URL + "annotations/" + img.id, response.data.status);
  }
}

export async function deleteImage(img: Image) {
  const headers = getHeader();
  const response = await axios.delete(API_URL + img.id, {
    headers: headers
  });
  if (response.data.status == STATUS_CODE.SUCCESS) {
    return;
  } else {
    console.log(response);
    throw new ServerError(API_URL + "annotations/" + img.id, response.data.status);
  }
}

export async function createLabel(label: Label):Promise<Label> {
  const headers = getHeader();
  console.log("send!!");
  const response = await axios.post(API_URL + "annotation_labels/create", label, {
    headers: headers
  })

  if (response.data.status == STATUS_CODE.SUCCESS) {
    const token = headers["x-access-token"] ?? "";
    return Label.buildFromObject(response.data.label);
  } else {
    throw new ServerError("label create error!", response.data.status);
  }
}
