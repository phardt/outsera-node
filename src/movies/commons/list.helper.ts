export class ListHelper {
  static getDuplicateItems<T>(list: T[], property: string): T[] {
    return list.filter(
      (item, index, array) =>
        array.map((mapItem) => mapItem[property]).indexOf(item[property]) !==
        index,
    );
  }

  static getAllDuplicateItems<T>(list: T[], property: string): T[] {
    const duplicateItems = [];
    this.getDuplicateItems([...list], property).forEach((item) => {
      list
        .filter((dItem) => dItem[property] === item[property])
        .forEach((dItem) => duplicateItems.push(dItem));
    });
    return duplicateItems;
  }
}
