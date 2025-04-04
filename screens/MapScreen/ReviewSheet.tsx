// screens/ReviewSheet.tsx
import { ChevronDown, User } from '@tamagui/lucide-icons'
import type { SheetProps } from '@tamagui/sheet'
import { Sheet } from '@tamagui/sheet'
import { onValue, push, ref } from 'firebase/database'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Alert, Image } from 'react-native'
import { Button, H3, Input, Paragraph, Text, XStack, YStack } from 'tamagui'
import { auth, database } from '../../services/firebase'

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

const snapPoints = [550, 190]

/**
 * ReviewSheet コンポーネント
 */
export const ReviewSheet: React.FC<ReviewSheetProps> = ({ open, setOpen }) => {
  const [position, setPosition] = useState(0)
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState<string>('')

  // ユーザー情報取得用の状態
  const [userName, setUserName] = useState<string>('ユーザー')
  const [userIcon, setUserIcon] = useState<string>('')

  // Firebase から現在のユーザー情報を取得
  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (uid) {
      const userRef = ref(database, `users/${uid}`)
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          setUserName(data.name || 'ユーザー')
          setUserIcon(data.profileImageUrl || '')
        }
      })
      return () => unsubscribe()
    }
  }, [])

  const handleClose = useCallback(() => setOpen(false), [setOpen])

  // レビュー送信処理
  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('エラー', '星評価を選択してください。')
      return
    }
    if (reviewText.trim() === '') {
      Alert.alert('エラー', 'レビュー内容を入力してください。')
      return
    }
    const userId = auth.currentUser?.uid
    if (!userId) {
      Alert.alert('エラー', 'ユーザーが認証されていません。')
      return
    }
    const reviewData = {
      rating,
      review: reviewText,
      userId,
      createdAt: Date.now(),
    }
    try {
      const reviewRef = ref(database, 'reviews')
      await push(reviewRef, reviewData)
      Alert.alert('成功', 'レビューが送信されました。')
      // 状態のリセットとモーダルのクローズ
      setRating(0)
      setReviewText('')
      handleClose()
    } catch (error: any) {
      Alert.alert('エラー', error.message)
    }
  }

  return (
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
    >
      <Sheet.Overlay
        backgroundColor="$shadow6"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$5">
        <SheetContents
          onClose={handleClose}
          rating={rating}
          setRating={setRating}
          reviewText={reviewText}
          setReviewText={setReviewText}
          onSubmitReview={handleSubmitReview}
          userName={userName}
          userIcon={userIcon}
        />
      </Sheet.Frame>
    </Sheet>
  )
}

interface SheetContentsProps {
  onClose: () => void
  rating: number
  setRating: React.Dispatch<React.SetStateAction<number>>
  reviewText: string
  setReviewText: React.Dispatch<React.SetStateAction<string>>
  onSubmitReview: () => void
  userName: string
  userIcon: string
}

/**
 * memo 化したシート内コンテンツコンポーネント
 */
const SheetContents: React.FC<SheetContentsProps> = memo(
  ({ onClose, rating, setRating, reviewText, setReviewText, onSubmitReview, userName, userIcon }) => (
    <>
      {/* ユーザー情報表示 */}
      <YStack alignItems="center" gap="$4">
        {userIcon ? (
          <Image
            source={{ uri: userIcon }}
            style={{ width: 60, height: 60, borderRadius: 30 }}
          />
        ) : (
          <User size={60} color="#ccc" />
        )}
        <H3>{userName}</H3>
        <Paragraph size="$6">このサービスはいかがでしたか？</Paragraph>
      </YStack>

      {/* 星評価 */}
      <XStack gap="$2" alignItems="center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            fontSize={30}
            color={rating >= star ? 'gold' : 'gray'}
            onPress={() => setRating(star)}
            style={{ cursor: 'pointer' }}
          >
            {rating >= star ? '★' : '☆'}
          </Text>
        ))}
      </XStack>

      {/* レビュー入力 */}
      <Input
        width={300}
        placeholder="レビューを入力..."
        value={reviewText}
        onChangeText={setReviewText}
      />

      {/* 送信ボタン */}
      <Button size="$4" onPress={onSubmitReview}>
        送信
      </Button>
    </>
  )
)
SheetContents.displayName = 'SheetContents'

export const InnerSheet: React.FC<SheetProps> = ({ onOpenChange, ...props }) => (
  <Sheet modal snapPoints={[90]} dismissOnSnapToBottom {...props}>
    <Sheet.Overlay
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
          <H3>Hello world</H3>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Paragraph key={i} size="$8">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Paragraph>
          ))}
        </YStack>
      </Sheet.ScrollView>
    </Sheet.Frame>
  </Sheet>
)

export default ReviewSheet
