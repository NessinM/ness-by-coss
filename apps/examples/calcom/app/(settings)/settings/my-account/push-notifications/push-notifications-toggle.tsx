"use client";

import { Field, FieldLabel } from "@ness/ui/components/field";
import { Switch } from "@ness/ui/components/switch";
import { toastManager } from "@ness/ui/components/toast";
import { useState } from "react";

export function PushNotificationsToggle() {
  const [enabled, setEnabled] = useState(false);

  function handleToggle(checked: boolean) {
    setEnabled(checked);
    toastManager.add({
      title: checked
        ? "Notifications enabled successfully"
        : "Notifications disabled successfully",
      type: "success",
    });
  }

  return (
    <Field>
      <FieldLabel>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
        Allow browser notifications
      </FieldLabel>
    </Field>
  );
}
