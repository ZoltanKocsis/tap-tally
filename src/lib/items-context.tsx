import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  addItem as dbAddItem,
  completeOnboarding as dbCompleteOnboarding,
  deleteItem as dbDeleteItem,
  getCurrentItemId,
  getItems,
  isOnboarded as dbIsOnboarded,
  renameItem as dbRenameItem,
  resetEverything as dbResetEverything,
  setCurrentItemId,
  type Item,
} from './db';

type ItemsContextValue = {
  items: Item[];
  currentItem: Item | null;
  onboarded: boolean;
  refresh: () => void;
  selectItem: (id: number) => void;
  addItem: (name: string) => void;
  renameItem: (id: number, name: string) => void;
  deleteItem: (id: number) => void;
  finishOnboarding: (name: string) => void;
  resetEverything: () => void;
};

const ItemsContext = createContext<ItemsContextValue | null>(null);

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(getItems);
  const [currentItemId, setCurrentId] = useState<number | null>(getCurrentItemId);
  const [onboarded, setOnboarded] = useState(dbIsOnboarded);

  const refresh = useCallback(() => {
    const nextItems = getItems();
    setItems(nextItems);
    setOnboarded(dbIsOnboarded());
    setCurrentId((prev) => (prev !== null && nextItems.some((i) => i.id === prev) ? prev : (nextItems[0]?.id ?? null)));
  }, []);

  const selectItem = useCallback((id: number) => {
    setCurrentItemId(id);
    setCurrentId(id);
  }, []);

  const addItemAction = useCallback((name: string) => {
    const item = dbAddItem(name);
    setCurrentItemId(item.id);
    setItems(getItems());
    setCurrentId(item.id);
  }, []);

  const renameItemAction = useCallback((id: number, name: string) => {
    dbRenameItem(id, name);
    setItems(getItems());
  }, []);

  const deleteItemAction = useCallback(
    (id: number) => {
      dbDeleteItem(id);
      refresh();
    },
    [refresh],
  );

  const finishOnboarding = useCallback((name: string) => {
    const item = dbCompleteOnboarding(name);
    setItems(getItems());
    setCurrentId(item.id);
    setOnboarded(true);
  }, []);

  const resetEverythingAction = useCallback(() => {
    dbResetEverything();
    setItems([]);
    setCurrentId(null);
    setOnboarded(false);
  }, []);

  const currentItem = useMemo(() => items.find((i) => i.id === currentItemId) ?? null, [items, currentItemId]);

  const value = useMemo<ItemsContextValue>(
    () => ({
      items,
      currentItem,
      onboarded,
      refresh,
      selectItem,
      addItem: addItemAction,
      renameItem: renameItemAction,
      deleteItem: deleteItemAction,
      finishOnboarding,
      resetEverything: resetEverythingAction,
    }),
    [
      items,
      currentItem,
      onboarded,
      refresh,
      selectItem,
      addItemAction,
      renameItemAction,
      deleteItemAction,
      finishOnboarding,
      resetEverythingAction,
    ],
  );

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
}

export function useItems(): ItemsContextValue {
  const ctx = useContext(ItemsContext);
  if (!ctx) throw new Error('useItems must be used within an ItemsProvider');
  return ctx;
}
