// TODO: I should go back and define all these managers as singletons properly...

import { EquipableWeapon } from "../enums";
import { EquipableWeaponAssets } from "../raymarcher";

export class WeaponAssetManger {
  private static instance: WeaponAssetManger;
  private weapons = new Map<EquipableWeapon, EquipableWeaponAssets>();

  private constructor() {}

  public static getInstance() {
    if (!WeaponAssetManger.instance) {
      WeaponAssetManger.instance = new WeaponAssetManger();
    }

    return WeaponAssetManger.instance;
  }

  registerWeaponAssets = (
    weaponType: EquipableWeapon,
    assets: EquipableWeaponAssets
  ) => {
    this.weapons.set(weaponType, assets);
  };

  getWeaponAssets = (weaponType: EquipableWeapon) => {
    return this.weapons.get(weaponType);
  };
}
