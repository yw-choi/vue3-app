export class Label {
  id: string = "";
  text: string = "";
  userId: string = "";

  public static buildFromObject(d: object) {
    const l = new Label();
    l.id = d["_id"];
    l.userId = d["userId"]
    l.text = d["text"];
    return l;
  }
}
