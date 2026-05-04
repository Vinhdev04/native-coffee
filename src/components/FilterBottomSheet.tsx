import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { COLORS, FONTS } from '@/styles/theme';
import { CheckCircle, Circle, ThumbsUp, Star, Truck, Clock } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const FilterBottomSheet = ({ visible, onClose }: Props) => {
  const [selected, setSelected] = useState('recommend');

  const filterOptions = [
    { id: 'recommend', label: 'Được đề xuất', icon: <ThumbsUp size={20} color={COLORS.textSecondary} /> },
    { id: 'rating', label: 'Đánh giá', icon: <Star size={20} color={COLORS.textSecondary} /> },
    { id: 'fee', label: 'Phí giao hàng', icon: <Truck size={20} color={COLORS.textSecondary} /> },
    { id: 'time', label: 'Thời gian giao hàng', icon: <Clock size={20} color={COLORS.textSecondary} /> },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={s.sheet}>
            <View style={s.header}>
              <Text style={s.title}>Lọc theo</Text>
            </View>
            <View style={s.optionsContainer}>
              {filterOptions.map((opt) => (
                <TouchableOpacity 
                  key={opt.id} 
                  style={s.optionRow} 
                  onPress={() => setSelected(opt.id)}
                >
                  <View style={s.optionLeft}>
                    {opt.icon}
                    <Text style={s.optionLabel}>{opt.label}</Text>
                  </View>
                  {selected === opt.id ? (
                    <CheckCircle size={24} color={COLORS.success} /> // Uses green like the screenshot
                  ) : (
                    <Circle size={24} color={COLORS.border} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  header: {
    padding: 20,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  optionsContainer: {
    paddingTop: 5,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  optionLabel: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});

export default FilterBottomSheet;
