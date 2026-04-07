"use client";

import { Button } from "@ness/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@ness/ui/components/dialog";
import { Field, FieldLabel } from "@ness/ui/components/field";
import { Form } from "@ness/ui/components/form";
import { Input } from "@ness/ui/components/input";
import type { ApiKeyItem } from "./api-keys-list";

interface EditApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKeyItem | null;
}

export function EditApiKeyDialog({
  open,
  onOpenChange,
  apiKey,
}: EditApiKeyDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open && !!apiKey}>
      <DialogPopup className="max-w-xl" showCloseButton={false}>
        {apiKey && (
          <Form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault();
              onOpenChange(false);
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit API key</DialogTitle>
            </DialogHeader>
            <DialogPanel className="grid gap-6">
              <Field>
                <FieldLabel>Name this key</FieldLabel>
                <Input
                  defaultValue={apiKey.note}
                  name="note"
                  placeholder="E.g. Development"
                  type="text"
                />
              </Field>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>
                Cancel
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </Form>
        )}
      </DialogPopup>
    </Dialog>
  );
}
