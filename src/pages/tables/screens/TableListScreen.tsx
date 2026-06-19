import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, RefreshControl, Modal,
  Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft, QrCode, RefreshCw, X,
  ShoppingBag, Coffee, LayoutGrid, CheckCircle2,
  UtensilsCrossed, ArrowLeft,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, FONTS } from '@/styles/theme';
import { fetchTables } from '@/services/orderService';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import s from '../styles/TableListScreen.styles.ts';

const { width } = Dimensions.get('window');

const TableListScreen = () => {
  const navigation = useNavigation<any>();
  const { setActiveTable } = useCart();
  const { user } = useAuth();

  const branchId = user?.branchId || (user as any)?.branch_id || 1;
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'EMPTY' | 'OCCUPIED'>('ALL');

  // Modal State
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showingQR, setShowingQR] = useState(false);

  const filteredTables = useMemo(() => {
    if (filter === 'ALL') return tables;
    return tables.filter(t => {
      const isOcc = ['ORDERED', 'OCCUPIED', 'IN_USE'].includes(String(t.status).toUpperCase());
      return filter === 'OCCUPIED' ? isOcc : !isOcc;
    });
  }, [tables, filter]);

  const loadTables = async () => {
    try {
      const res = await fetchTables(branchId);
      const data = (res as any)?.data?.rows || (res as any)?.data || (res as any)?.rows || res || [];
      setTables(data);
    } catch (err) {
      console.error('Lỗi tải danh sách bàn:', err);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải danh sách bàn' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadTables();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTables();
  };

  const handlePressTable = (table: any) => {
    setSelectedTable(table);
    setShowingQR(false);
    setModalVisible(true);
  };

  // Click icon QR trên card → bỏ qua bước chọn hành động, mở thẳng QR
  const handleShowQRDirect = (table: any) => {
    setSelectedTable(table);
    setShowingQR(true);
    setModalVisible(true);
  };

  const handleStartOrder = () => {
    if (!selectedTable) return;
    setActiveTable({
      id: selectedTable.id,
      name: selectedTable.name,
      qrToken: selectedTable.qrToken || String(selectedTable.id),
    });
    setModalVisible(false);
    Toast.show({
      type: 'success',
      text1: `✅ Đã chọn ${selectedTable.name}`,
    });
    navigation.navigate('Main', { screen: 'MenuTab' });
  };

  const handleShowQR = () => {
    setShowingQR(true);
  };

  const totalOccupied = tables.filter(t =>
    ['ORDERED', 'OCCUPIED', 'IN_USE'].includes(String(t.status).toUpperCase())
  ).length;
  const totalEmpty = tables.length - totalOccupied;

  /* ─── Render Card ─── */
  const renderItem = ({ item }: { item: any }) => {
    const isOccupied = ['ORDERED', 'OCCUPIED', 'IN_USE'].includes(String(item.status).toUpperCase());

    return (
      <TouchableOpacity
        style={[s.card, isOccupied ? s.cardOccupied : s.cardEmpty]}
        onPress={() => handlePressTable(item)}
        activeOpacity={0.75}
      >
        {/* Accent bar on top */}
        <View
          style={[
            s.cardAccentBar,
            { backgroundColor: isOccupied ? '#FF7A00' : '#10B981' },
          ]}
        />

        {/* Status badge */}
        <View style={s.cardHeader}>
          <View style={[s.statusBadge, isOccupied ? s.badgeOccupied : s.badgeEmpty]}>
            <View
              style={[
                s.statusDot,
                { backgroundColor: isOccupied ? '#FF7A00' : '#10B981' },
              ]}
            />
            <Text style={[s.statusText, { color: isOccupied ? '#FF7A00' : '#10B981' }]}>
              {isOccupied ? 'Đang dùng' : 'Trống'}
            </Text>
          </View>
        </View>

        {/* Table name + icon */}
        <View style={s.tableNameRow}>
          <View
            style={[
              s.tableIcon,
              {
                backgroundColor: isOccupied
                  ? 'rgba(255, 122, 0, 0.12)'
                  : 'rgba(16, 185, 129, 0.1)',
              },
            ]}
          >
            {isOccupied
              ? <UtensilsCrossed size={16} color="#FF7A00" />
              : <Coffee size={16} color="#10B981" />}
          </View>
          <Text style={s.tableName} numberOfLines={1}>{item.name}</Text>
        </View>

        <View style={s.cardDivider} />

        {/* Footer action hints */}
        <View style={s.cardFooter}>
          <TouchableOpacity
            style={s.footerBtn}
            onPress={() => handleShowQRDirect(item)}
            activeOpacity={0.7}
          >
            <QrCode size={13} color="#64748B" />
            <Text style={s.footerBtnText}>QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={isOccupied ? s.footerBtnOccupied : s.footerBtn}
            onPress={() => handlePressTable(item)}
            activeOpacity={0.7}
          >
            <ShoppingBag size={13} color={isOccupied ? '#FF7A00' : '#64748B'} />
            <Text style={isOccupied ? s.footerBtnTextOccupied : s.footerBtnText}>
              Gọi món
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  /* ─── MAIN RENDER ─── */
  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F1E" />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={s.headerTitleContainer}>
            <Text style={s.headerTitle}>Quản lý bàn</Text>
            <Text style={s.headerSubtitle}>Chi nhánh #{branchId}</Text>
          </View>
        </View>

        <View style={s.headerRight}>
          <TouchableOpacity style={s.actionBtn} onPress={onRefresh}>
            <RefreshCw size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => navigation.navigate('ScanQR', { scanType: 'table' })}
          >
            <QrCode size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats Bar ── */}
      <View style={s.statsBar}>
        {/* Tổng số bàn */}
        <View style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <LayoutGrid size={18} color="#818CF8" />
          </View>
          <View style={s.statTexts}>
            <Text style={s.statValue}>{tables.length}</Text>
            <Text style={s.statLabel}>Tổng bàn</Text>
          </View>
        </View>

        {/* Trống */}
        <View style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <CheckCircle2 size={18} color="#10B981" />
          </View>
          <View style={s.statTexts}>
            <Text style={[s.statValue, { color: '#10B981' }]}>{totalEmpty}</Text>
            <Text style={s.statLabel}>Trống</Text>
          </View>
        </View>

        {/* Đang dùng */}
        <View style={s.statCard}>
          <View style={[s.statIconWrap, { backgroundColor: 'rgba(255, 122, 0, 0.12)' }]}>
            <UtensilsCrossed size={18} color="#FF7A00" />
          </View>
          <View style={s.statTexts}>
            <Text style={[s.statValue, { color: '#FF7A00' }]}>{totalOccupied}</Text>
            <Text style={s.statLabel}>Đang dùng</Text>
          </View>
        </View>
      </View>

      {/* ── Filter Tabs ── */}
      <View style={s.filtersContainer}>
        {(['ALL', 'EMPTY', 'OCCUPIED'] as const).map(f => {
          const labels: Record<string, string> = {
            ALL: `Tất cả (${tables.length})`,
            EMPTY: `Trống (${totalEmpty})`,
            OCCUPIED: `Đang dùng (${totalOccupied})`,
          };
          return (
            <TouchableOpacity
              key={f}
              style={[s.filterBtn, filter === f && s.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterText, filter === f && s.filterTextActive]}>
                {labels[f]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List ── */}
      {loading && !refreshing ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={s.emptyText}>Đang tải danh sách bàn...</Text>
        </View>
      ) : filteredTables.length === 0 ? (
        <View style={s.center}>
          <LayoutGrid size={48} color="#1E293B" />
          <Text style={s.emptyText}>Chưa có dữ liệu bàn</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTables}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={s.listContent}
          columnWrapperStyle={s.row}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      {/* ── Bottom-sheet Modal ── */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { setModalVisible(false); setShowingQR(false); }}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => { setModalVisible(false); setShowingQR(false); }}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={s.modalContent}>
              {/* Drag handle */}
              <View style={s.modalDragHandle} />

              {/* Header */}
              <View style={s.modalHeader}>
                <View style={s.modalTitleRow}>
                  <View style={s.modalTableIcon}>
                    <Coffee size={20} color="#FF7A00" />
                  </View>
                  <Text style={s.modalTitle}>{selectedTable?.name}</Text>
                </View>
                <TouchableOpacity
                  style={s.modalCloseBtn}
                  onPress={() => { setModalVisible(false); setShowingQR(false); }}
                >
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {showingQR && selectedTable ? (
                /* ── QR View ── */
                <View style={s.qrContainer}>
                  <Text style={s.modalSubtitle}>Mã QR của {selectedTable.name}</Text>
                  <View style={s.qrWrapper}>
                    <QRCode
                      value={`https://bill-dev.chips.com.vn/qr?token=${selectedTable.qrToken || selectedTable.id}`}
                      size={200}
                      color="#0F172A"
                      backgroundColor="#FFFFFF"
                    />
                  </View>
                  <Text style={s.qrHint}>
                    Khách hàng quét mã này để tự gọi món
                  </Text>
                  <TouchableOpacity
                    style={s.modalBtnSecondary}
                    onPress={() => setShowingQR(false)}
                  >
                    <ArrowLeft size={18} color="#FF7A00" />
                    <Text style={s.modalBtnTextSecondary}>Quay lại thao tác</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ── Action View ── */
                <>
                  <Text style={s.modalSubtitle}>Chọn thao tác trên bàn này:</Text>

                  <TouchableOpacity style={s.modalBtnPrimary} onPress={handleStartOrder}>
                    <ShoppingBag size={20} color="#FFF" />
                    <Text style={s.modalBtnTextPrimary}>Bắt đầu gọi món</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={s.modalBtnSecondary} onPress={handleShowQR}>
                    <QrCode size={20} color={COLORS.primary} />
                    <Text style={s.modalBtnTextSecondary}>Hiển thị mã QR của bàn</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default TableListScreen;
