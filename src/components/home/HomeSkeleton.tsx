import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Skeleton from '@/components/common/Skeleton';
import { SPACING } from '@/styles/theme';

const HomeSkeleton = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Categories Skeleton */}
      <View style={s.catContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={s.catItem}>
              <Skeleton width={60} height={60} borderRadius={30} />
              <Skeleton width={50} height={10} style={{ marginTop: 8 }} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Products Skeleton */}
      <View style={s.productSection}>
        <Skeleton width={150} height={20} style={{ marginBottom: 15 }} />
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={s.productCard}>
            <Skeleton width={90} height={90} borderRadius={12} />
            <View style={s.productInfo}>
              <Skeleton width="80%" height={18} />
              <Skeleton width="100%" height={12} style={{ marginTop: 8 }} />
              <Skeleton width="40%" height={12} style={{ marginTop: 5 }} />
              <View style={s.footer}>
                <Skeleton width={80} height={20} />
                <Skeleton width={28} height={28} borderRadius={8} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  catContainer: {
    paddingVertical: 15,
  },
  catList: {
    paddingHorizontal: 15,
    gap: 15,
  },
  catItem: {
    alignItems: 'center',
    width: 75,
  },
  productSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 12,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default HomeSkeleton;
