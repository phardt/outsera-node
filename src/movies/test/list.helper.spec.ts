import { ListHelper } from '../commons/list.helper';

describe('ListHelper', () => {
  describe('getDuplicateItems', () => {
    it('should return duplicate items based on a property', () => {
      const list = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Alice' },
        { id: 4, name: 'Charlie' },
      ];

      const result = ListHelper.getDuplicateItems(list, 'name');

      expect(result).toEqual([{ id: 3, name: 'Alice' }]);
    });

    it('should return an empty array if no duplicates are found', () => {
      const list = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];

      const result = ListHelper.getDuplicateItems(list, 'name');

      expect(result).toEqual([]);
    });
  });

  describe('getAllDuplicateItems', () => {
    it('should return all items that are part of duplicate groups based on a property', () => {
      const list = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Alice' },
        { id: 4, name: 'Charlie' },
        { id: 5, name: 'Bob' },
      ];

      const result = ListHelper.getAllDuplicateItems(list, 'name');

      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 3, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 5, name: 'Bob' },
      ]);
    });

    it('should return an empty array if no duplicates are found', () => {
      const list = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ];

      const result = ListHelper.getAllDuplicateItems(list, 'name');

      expect(result).toEqual([]);
    });
  });
});
