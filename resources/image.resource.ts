import { Resource, AssetService } from '../services/asset.service';

export class ImageResource extends Resource {
  image!: HTMLImageElement;
  static readonly TYPE = "png";

  get type() { return ImageResource.TYPE; }
  get format(): XMLHttpRequestResponseType { return "blob"; }

  assemble(response: any): void {
    this.image = new Image()
    this.image.src = URL.createObjectURL(response);
  }

  get ready(): boolean { return this.image != null && this.image.width > 0 && this.image.height > 0; }

  constructor(name: string, folder: string[]) {
    super(name, folder);
  }

}
