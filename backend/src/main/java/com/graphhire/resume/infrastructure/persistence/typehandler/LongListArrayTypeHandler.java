package com.graphhire.resume.infrastructure.persistence.typehandler;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.Array;
import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class LongListArrayTypeHandler extends BaseTypeHandler<List<Long>> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<Long> parameter, JdbcType jdbcType) throws SQLException {
        Array sqlArray = ps.getConnection().createArrayOf("bigint", parameter.toArray(new Long[0]));
        ps.setArray(i, sqlArray);
    }

    @Override
    public List<Long> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return toList(rs.getArray(columnName));
    }

    @Override
    public List<Long> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return toList(rs.getArray(columnIndex));
    }

    @Override
    public List<Long> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return toList(cs.getArray(columnIndex));
    }

    private List<Long> toList(Array array) throws SQLException {
        if (array == null) {
            return Collections.emptyList();
        }
        Object raw = array.getArray();
        if (!(raw instanceof Object[] objects) || objects.length == 0) {
            return Collections.emptyList();
        }
        List<Long> result = new ArrayList<>(objects.length);
        for (Object item : objects) {
            if (item == null) {
                continue;
            }
            if (item instanceof Number number) {
                result.add(number.longValue());
                continue;
            }
            try {
                result.add(Long.parseLong(String.valueOf(item)));
            } catch (Exception ignored) {
            }
        }
        return result;
    }
}

