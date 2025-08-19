import { AssetService } from '../services/asset.service';
import { EventService } from '../services/event.service';
import { KeyboardService } from '../services/keyboard.service';
import { RenderService } from '../services/render.service';
import { TaskService } from '../services/task.service';
import { PointerService } from '../services/pointer.service';
import { ControllerService } from '../services/controller.service';
import { SceneService } from '../services/scene.service';
import { Stage } from '../vision/stage';

export function main(): void {

  Stage.initiate([
    new PointerService(),
    new KeyboardService(),
    new ControllerService(),
    new RenderService(),
    new TaskService(),
    new EventService(),
    new AssetService(),
    new SceneService(),
  ]);
}

