import {
  Group,
  Mesh,
  CylinderGeometry,
  SphereGeometry,
  BoxGeometry,
  MeshStandardMaterial,
  Vector3
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const NPCS_DATA = [
  {
    id: 'elder',
    name: '촌장 엘드린',
    title: '성소의 수호 장로',
    model: 'Mage.glb',
    position: { x: 0, y: 0, z: -8 },
    color: 0x38bdf8,
    dialogs: {
      default: '어서오게나, 젊은 용사여! 공허의 군세가 성소를 위협하고 있네. 자네의 강력한 마법으로 평화를 되찾아주게.',
      questAvailable: '오! 마침 자네에게 부탁할 중요한 임무가 있네.',
      questComplete: '훌륭하네! 자네 덕분에 성소의 결계가 한결 안전해졌군. 여기 약소하지만 보상을 받게나.'
    }
  },
  {
    id: 'blacksmith',
    name: '대장장이 카일',
    title: '성소 무기 장인',
    model: 'Barbarian.glb',
    position: { x: -10.5, y: 0, z: -4 },
    color: 0xf59e0b,
    dialogs: {
      default: '무기와 방어구는 생명줄이지! 몬스터들을 사냥해서 더 강력한 전설 장비를 파밍해보게나.',
      questAvailable: '남쪽 초원의 미니언 녀석들이 광석 수송을 방해하고 있어. 손 좀 봐주겠나?',
      questComplete: '하하! 속이 다 시원하군! 자네에게 어울릴 만한 고급 장신구를 하나 선물하지.'
    }
  },
  {
    id: 'mage_lia',
    name: '연금술사 셀리아',
    title: '원소 길드 연구원',
    model: 'Rogue.glb',
    position: { x: 10.5, y: 0, z: -4 },
    color: 0xc084fc,
    dialogs: {
      default: '원소 마법의 신비는 무궁무진해요. 얼음, 번개, 불꽃, 빛... 모든 원소를 자유자재로 다뤄보세요!',
      questAvailable: '흑요석 협곡의 불꽃 원소 마물들이 폭주하고 있어요. 정화가 필요해요.',
      questComplete: '역시 대단해요! 연구에 큰 도움이 되었어요. 이 마법 망토를 받아주세요.'
    }
  }
];

export class NPCManager {
  constructor(scene, questManager) {
    this.scene = scene;
    this.questManager = questManager;
    this.npcs = [];
    this.group = new Group();
    this.scene.add(this.group);
    this.gltfLoader = new GLTFLoader();

    this._createNPCs();
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  _createNPCs() {
    for (const data of NPCS_DATA) {
      const npcRoot = new Group();
      npcRoot.position.set(data.position.x, data.position.y, data.position.z);

      // Load High-Detail Blender Model
      this.gltfLoader.load(`./models/${data.model}`, (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(1.05);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        // Remove procedural placeholder
        while (npcRoot.children.length > 0) {
          npcRoot.remove(npcRoot.children[0]);
        }
        npcRoot.add(model);
      });

      // Procedural Placeholder for instant 0ms display
      const bodyMat = new MeshStandardMaterial({ color: data.color, roughness: 0.35 });
      const bodyGeo = new CylinderGeometry(0.35, 0.45, 1.4, 16);
      const bodyMesh = new Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = 0.7;
      npcRoot.add(bodyMesh);

      const headMat = new MeshStandardMaterial({ color: 0xffe0bd, roughness: 0.6 });
      const headGeo = new SphereGeometry(0.32, 16, 16);
      const headMesh = new Mesh(headGeo, headMat);
      headMesh.position.y = 1.6;
      npcRoot.add(headMesh);

      this.group.add(npcRoot);

      this.npcs.push({
        data,
        root: npcRoot,
        position: new Vector3(data.position.x, data.position.y, data.position.z)
      });
    }
  }

  getNearbyNPC(playerPos, radius = 3.5) {
    for (const npc of this.npcs) {
      const dist = playerPos.distanceTo(npc.position);
      if (dist <= radius) {
        return npc;
      }
    }
    return null;
  }

  update(dt, playerPos) {
    if (!playerPos) return;
    for (const npc of this.npcs) {
      const dist = npc.position.distanceTo(playerPos);
      if (dist < 8.0) {
        const dir = playerPos.clone().sub(npc.position);
        dir.y = 0;
        if (dir.lengthSq() > 0.001) {
          npc.root.rotation.y = Math.atan2(dir.x, dir.z);
        }
      }
    }
  }
}
