import { ChevronDown } from '@tamagui/lucide-icons'
import type { SheetProps } from '@tamagui/sheet'
import { Sheet } from '@tamagui/sheet'
import React, { memo, useCallback, useState } from 'react'
import { Button, H2, Input, Paragraph, YStack } from 'tamagui'

/**
 * カスタムフック: シートの開閉状態を管理
 */
export const useReviewSheet = () => {
  const [open, setOpen] = useState(false)
  const openSheet = useCallback(() => setOpen(true), [])
  const closeSheet = useCallback(() => setOpen(false), [])

  return { open, setOpen, openSheet, closeSheet }
}

interface ReviewSheetProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

// snapPoints 定数（必要に応じて調整可能）
const snapPoints = [256, 190]

/**
 * ReviewSheet コンポーネント
 */
export const ReviewSheet: React.FC<ReviewSheetProps> = ({ open, setOpen }) => {
  const [position, setPosition] = useState(0)

  // シートを閉じるためのメモ化コールバック
  const handleClose = useCallback(() => setOpen(false), [setOpen])

  return (
    <>
      <YStack gap="$4">

      </YStack>

      <Sheet
        forceRemoveScrollEnabled={open}
        modal={true}
        open={open}
        onOpenChange={setOpen}
        snapPoints={snapPoints}
        snapPointsMode="constant"
        dismissOnSnapToBottom
        position={position}
        onPositionChange={setPosition}
        zIndex={100_000}
        moveOnKeyboardChange
      // animation={"medium" as any} // 一旦型アサーションで回避
      >
        <Sheet.Overlay
          // animation={"lazy" as any} // 同上
          backgroundColor="$shadow6"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Sheet.Handle />
        <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$5">
          <SheetContents onClose={handleClose} />
        </Sheet.Frame>
      </Sheet>
    </>
  )
}

interface SheetContentsProps {
  onClose: () => void
}

/**
 * memo 化したシート内コンテンツコンポーネント
 */
const SheetContents: React.FC<SheetContentsProps> = memo(({ onClose }) => (
  <>
    <Button size="$6" circular icon={ChevronDown} onPress={onClose} />
    <Input width={200} />
  </>
))
SheetContents.displayName = 'SheetContents'

/**
 * InnerSheet コンポーネント
 */
export const InnerSheet: React.FC<SheetProps> = ({ onOpenChange, ...props }) => (
  <Sheet
    // animation={"medium" as any}
    modal snapPoints={[90]} dismissOnSnapToBottom {...props}>
    <Sheet.Overlay
      // animation={"medium" as any}
      bg="$shadow2"
      enterStyle={{ opacity: 0 }}
      exitStyle={{ opacity: 0 }}
    />

    <Sheet.Handle />
    <Sheet.Frame flex={1} justifyContent="center" alignItems="center" gap="$5">
      <Sheet.ScrollView>
        <YStack padding="$5" gap="$8">
          <Button
            size="$6"
            circular
            alignSelf="center"
            icon={ChevronDown}
            onPress={() => onOpenChange?.(false)}
          />
          <H2>Hello world</H2>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Paragraph key={i} size="$8">
              Eu officia sunt ipsum nisi dolore labore est laborum laborum in esse ad
              pariatur. Dolor excepteur esse deserunt voluptate labore ea. Exercitation
              ipsum deserunt occaecat cupidatat consequat est adipisicing velit
              cupidatat ullamco veniam aliquip reprehenderit officia. Officia labore
              culpa ullamco velit. In sit occaecat velit ipsum fugiat esse aliqua dolor
              sint.
            </Paragraph>
          ))}
        </YStack>
      </Sheet.ScrollView>
    </Sheet.Frame>
  </Sheet>
)

export default ReviewSheet
